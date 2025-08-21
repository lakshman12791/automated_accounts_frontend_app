import { useEffect, useRef, useState } from 'react'
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
      const res = await fetch('/api/receipts/upload', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        let msg = 'Upload failed'
        try {
          const errData = await res.json()
          msg = errData.error || msg
        } catch {}
        throw new Error(msg)
      }

      const data = await res.json()
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

function ReceiptsTable({ rows, onDelete }) {
  if (!rows.length) return <p className="read-the-docs">No receipts yet.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Merchant</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Total</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Currency</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>File</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Uploaded</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>{r.id}</td>
              <td style={{ padding: '8px' }}>{r.merchant || '-'}</td>
              <td style={{ padding: '8px' }}>{r.date || '-'}</td>
              <td style={{ padding: '8px' }}>
                {formatCurrency(r.total_amount, r.currency)}
              </td>
              <td style={{ padding: '8px' }}>{r.currency || '-'}</td>
              <td style={{ padding: '8px' }}>
                <a
                  href={`/api/receipts/${r.id}/file`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {r.original_filename}
                </a>
              </td>
              <td style={{ padding: '8px' }}>
                {new Date(r.uploaded_at).toLocaleString()}
              </td>
              <td style={{ padding: '8px' }}>
                <button
                  onClick={() => onDelete(r)}
                  style={{ background: '#3a3a3a' }}
                >
                  Delete
                </button>
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

  async function loadReceipts(signal) {
    setLoading(true)
    try {
      const url = query
        ? `/api/receipts?q=${encodeURIComponent(query)}`
        : '/api/receipts'

      const res = await fetch(url, { signal })
      const data = await res.json()
      setReceipts(Array.isArray(data) ? data : [])
    } catch (_) {
      // ignore aborts/errors
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const c = new AbortController()
    loadReceipts(c.signal)
    return () => c.abort()
  }, [])

  useEffect(() => {
    const c = new AbortController()
    const id = setTimeout(() => loadReceipts(c.signal), 300)
    return () => {
      clearTimeout(id)
      c.abort()
    }
  }, [query])

  function handleUploaded(newRow) {
    setReceipts((prev) => [newRow, ...prev])
  }

  async function handleDelete(row) {
    const ok = window.confirm(`Delete receipt #${row.id}?`)
    if (!ok) return
    try {
      await fetch(`/api/receipts/${row.id}`, { method: 'DELETE' })
      setReceipts((prev) => prev.filter((r) => r.id !== row.id))
    } catch (_) {}
  }

  return (
    <>
      <h1>Receipt Uploader</h1>
      <UploadForm onUploaded={handleUploaded} />
      <SearchBar query={query} onChange={setQuery} />
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ReceiptsTable rows={receipts} onDelete={handleDelete} />
      )}
    </>
  )
}

export default App
