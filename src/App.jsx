import { useEffect, useRef, useState } from 'react'
import { listReceipts, uploadReceipt } from './api/receipts'
import './App.css'

function formatCurrency(amount, currency) {
  if (amount == null) return '-'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  } catch {
    return amount.toFixed ? amount.toFixed(2) : String(amount)
  }
}

function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!file) return setError('Choose a PDF receipt')

    const form = new FormData()
    form.append('file', file)
    setBusy(true)

    try {
      const data = await uploadReceipt(file)
      onUploaded?.(data)

      // Reset file input
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <input
        id="file-input"
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit" disabled={busy || !file}>
        {busy ? 'Uploading...' : 'Upload PDF'}
      </button>
      {error && <span style={{ color: '#f66' }}>{error}</span>}
    </form>
  )
}

function SearchBar({ query, onChange }) {
  return (
    <div
      style={{
        margin: '1rem 0',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <input
        placeholder="Search by filename, merchant, or text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 'min(720px, 95%)',
          padding: '0.6rem',
          borderRadius: 8,
          border: '1px solid #444',
          background: 'transparent',
          color: 'inherit',
        }}
      />
    </div>
  )
}

function ReceiptsTable({ rows }) {
  if (!rows.length) return <p className="read-the-docs">No receipts yet.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>S.No.</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Merchant</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Purchased Date</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Total</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Uploaded</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={r.id} style={{ borderTop: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>{index + 1}</td>
              <td style={{ padding: '8px' }}>{r._id}</td>
              <td style={{ padding: '8px' }}>{r.merchant_name || '-'}</td>
              <td style={{ padding: '8px' }}>{r.purchased_at || '-'}</td>
              <td style={{ padding: '8px' }}>
                {formatCurrency(r.total_amount, "CAD")}
              </td>
              <td style={{ padding: '8px' }}>
                {new Date(r.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function App() {
  const [receipts, setReceipts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Filter receipts based on search query
  const filteredReceipts = receipts.filter(receipt => {
    if (!query.trim()) return true
    
    const searchTerm = query.toLowerCase()
    const merchantName = (receipt.merchant_name || '').toLowerCase()
    const purchasedAt = (receipt.purchased_at || '').toLowerCase()
    const totalAmount = String(receipt.total_amount || '').toLowerCase()
    const createdAt = new Date(receipt.createdAt).toLocaleString().toLowerCase()
    
    return merchantName.includes(searchTerm) ||
           purchasedAt.includes(searchTerm) ||
           totalAmount.includes(searchTerm) ||
           createdAt.includes(searchTerm)
  })

  
  async function loadReceipts() {
    setLoading(true)
    try {
      const data = await listReceipts('') // Remove signal parameter
      console.log("data 164", data)
      setReceipts(Array.isArray(data?.receiptsArray) ? data?.receiptsArray : [])
    } catch (error) {
      console.error('Failed to load receipts:', error)
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReceipts()
  }, [])

  function handleUploaded(newRow) {
    setReceipts((prev) => [newRow, ...prev])
  }



  return (
    <>
      <h1>Receipt Uploader</h1>
      <UploadForm onUploaded={handleUploaded} />
      <SearchBar query={query} onChange={setQuery} />
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ReceiptsTable rows={filteredReceipts} />
      )}
    </>
  )
}

export default App
