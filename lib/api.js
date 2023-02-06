import https from 'https'
import fs from 'fs'

const agent = new https.Agent({
  maxSockets: 1000
})

export default {
  request (path, auth, options) {
    return new Promise((resolve, reject) => {
      const req = https.request({
        method: options.method || 'GET',
        host: 'api.discloud.app',
        path: `/v2${path}`,
        headers: {
          'api-token': auth,
          'Content-Type': options.file ? 'multipart/form-data; boundary=discloud' : 'application/json'
        },
        agent
      }, async message => {
        message.on('error', reject)

        const bufs = []

        for await (const chunk of message) {
          bufs.push(chunk)
        }

        const data = Buffer.concat(bufs).toString('utf-8')

        if (data) {
          resolve(JSON.parse(data))
        } else {
          resolve({
            statusCode: message.statusCode,
            message: message.statusMessage
          })
        }
      })

      if (options.file && fs.statSync(options.file).size <= 1e+8) {
        req.write(Buffer.concat([
          Buffer.from(`--discloud\r\nContent-Disposition: form-data; filename="${options.file}"; name="file";\r\nContent-Type: application/octet-stream;\r\n\r\n`, 'utf8'),
          Buffer.from(fs.readFileSync(options.file), 'binary'),
          Buffer.from('\r\n--discloud--\r\n', 'utf8')
        ]))
      } else if (options.body) {
        const data = typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body)

        req.setHeader('Content-Length', data.length)
        req.write(data)
      }

      req.end()
    })
  }
}
