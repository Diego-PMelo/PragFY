import api from './api'

export const profileService = {
  get: (userId) =>
    api.get('/profile', { params: { userId } }).then(r => r.data),

  save: (data) =>
    api.post('/profile', data).then(r => r.data)
}
