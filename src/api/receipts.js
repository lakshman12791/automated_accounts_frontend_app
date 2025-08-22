import client from './client'

export async function listReceipts(query, options = {}) {
  const params = {}
  if (query) params.q = query
  const response = await client.get(`/receipts/list-receipts`, { params })
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

export async function validateReceipt(file) {
  const form = new FormData()
  form.append('file', file)
  const response = await client.post('/receipts/validate', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function processReceipt(file) {
  const form = new FormData()
  form.append('file', file)
  const response = await client.post('/receipts/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function getReceipt(receiptId) {
  const response = await client.get(`/receipts/get-receipt-detail/${receiptId}`)
  return response.data
}


