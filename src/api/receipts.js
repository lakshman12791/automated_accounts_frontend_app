import client from './client'

export async function listReceipts(query, options = {}) {
  const params = {}
  if (query) params.q = query
  const response = await client.get(`/receipts`, { params })
  return response.data
}

export async function uploadReceipt(file) {
  const form = new FormData()
  form.append('file', file)
  const response = await client.post('/receipts/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function validateReceipt(id) {
  const response = await client.post(`/receipts/${id}/validate`)
  return response.data
}

export async function processReceipt(id) {
  const response = await client.post(`/receipts/${id}/process`)
  return response.data
}

export async function getReceipt(id) {
  const response = await client.get(`/receipts/${id}`)
  return response.data
}


