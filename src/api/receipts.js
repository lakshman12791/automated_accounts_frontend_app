import client from './client'


export async function listReceipts(query, options = {}) {
  const params = {}
  if (query) params.q = query
  const response = await client.get(`/receipts`, { params, signal: options.signal })
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

export async function deleteReceipt(id) {
  await client.delete(`/receipts/${id}`)
}


