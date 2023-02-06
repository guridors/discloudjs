import api from './api.js'

export default {
  create (auth) {
    return {
      upload: file => api.request('/upload', auth, {
        method: 'POST',
        file
      })
    }
  }
}
