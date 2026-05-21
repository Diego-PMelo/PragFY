import api from './api'

export const transactionService = {
  list: (userId, month, year) =>
    api.get('/transactions', { params: { userId, month, year } }).then(r => r.data),

  summary: (userId, month, year) =>
    api.get('/transactions/summary', { params: { userId, month, year } }).then(r => r.data),

  create: (data) =>
    api.post('/transactions', data).then(r => r.data),

  update: (id, data) =>
    api.put(`/transactions/${id}`, data).then(r => r.data),

  remove: (id) =>
    api.delete(`/transactions/${id}`)
}
