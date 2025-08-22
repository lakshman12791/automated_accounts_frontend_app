import { useEffect, useRef, useState } from 'react'
import { listReceipts, uploadReceipt, validateReceipt, processReceipt, getReceipt } from './api/receipts'
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

function OperationSelector({ selectedOperation, onOperationChange }) {
  const operations = [
    { value: 'upload', label: '📄 Upload Document', description: 'Upload a new PDF receipt' },
    { value: 'validate', label: '✅ Validate Receipt', description: 'Validate an existing receipt' },
    { value: 'process', label: '⚙️ Process Receipt', description: 'Process a validated receipt' },
    { value: 'get', label: '📋 Get Receipts', description: 'View all receipts' }
  ]

  return (
    <div className="operation-selector">
      <label htmlFor="operation-select">Select Operation:</label>
      <select
        id="operation-select"
        value={selectedOperation}
        onChange={(e) => onOperationChange(e.target.value)}
        className="operation-dropdown"
      >
        {operations.map(op => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      <div className="operation-description">
        {operations.find(op => op.value === selectedOperation)?.description}
      </div>
    </div>
  )
}

function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) return setError('Choose a PDF receipt')

    setBusy(true)

    try {
      const data = await uploadReceipt(file)
      setSuccess('Document uploaded successfully!')
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
    <div className="operation-panel">
      <h2>Upload Document</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-container">
          <input
            id="file-input"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            {file ? file.name : 'Choose PDF File'}
          </label>
        </div>
        <button type="submit" disabled={busy || !file} className="submit-btn">
          {busy ? 'Uploading...' : 'Upload PDF'}
        </button>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  )
}

function ValidateForm({ onValidated }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [messageType, setMessageType] = useState('green')
  const fileInputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) return setError('Choose a PDF receipt to validate')

    setBusy(true)

    try {
      const data = await validateReceipt(file)
      console.log("onvalidate", data)
      if (data?.isValid === false) {
        setMessageType('red')
        setSuccess(data?.message)
      }
      else {
        setMessageType('red')
        setSuccess(data?.message)
      }
      // setSuccess('Receipt validated successfully!')
      onValidated?.(data)

      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Validation failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="operation-panel">
      <h2>Validate Receipt</h2>
      <form onSubmit={handleSubmit} className="validate-form">
        <div className="file-input-container">
          <input
            id="validate-file-input"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input"
          />
          <label htmlFor="validate-file-input" className="file-input-label">
            {file ? file.name : 'Choose PDF File'}
          </label>
        </div>
        <button type="submit" disabled={busy || !file} className="submit-btn">
          {busy ? 'Validating...' : 'Validate PDF'}
        </button>
        {error && <div className="error-message">{error}</div>}
        {/* {success && <div className="success-message">{success}</div>}
         */}
        {messageType === 'green' ? (
          success && <div className="success-message">{success}</div>
        ) : (
          success && <div className="error-message">{success}</div>
        )}

      </form>
    </div>
  )
}

function ProcessForm({ onProcessed }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) return setError('Choose a PDF receipt to process')

    setBusy(true)

    try {
      const data = await processReceipt(file)
      setSuccess('Receipt processed successfully!')
      onProcessed?.(data)

      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Processing failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="operation-panel">
      <h2>Process Receipt</h2>
      <form onSubmit={handleSubmit} className="process-form">
        <div className="file-input-container">
          <input
            id="process-file-input"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input"
          />
          <label htmlFor="process-file-input" className="file-input-label">
            {file ? file.name : 'Choose PDF File'}
          </label>
        </div>
        <button type="submit" disabled={busy || !file} className="submit-btn">
          {busy ? 'Processing...' : 'Process PDF'}
        </button>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </form>
    </div>
  )
}

function SearchBar({ query, onChange }) {
  return (
    <div className="search-container">
      <input
        placeholder="Search by filename, merchant, or text..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  )
}

function ReceiptsTable({ rows }) {
  if (!rows.length) return <p className="no-receipts">No receipts found.</p>

  return (
    <div className="table-container">
      <table className="receipts-table">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>ID</th>
            <th>Merchant</th>
            <th>Purchased Date</th>
            <th>Total</th>
            <th>Uploaded</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={r._id} className="receipt-row">
              <td>{index + 1}</td>
              <td className="receipt-id">{r._id}</td>
              <td>{r.merchant_name || '-'}</td>
              <td>{r.purchased_at || '-'}</td>
              <td className="amount">{formatCurrency(r.total_amount, "CAD")}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>
                <span className={`status-badge ${r.status || 'pending'}`}>
                  {r.status || 'Pending'}
                </span>
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
  const [selectedOperation, setSelectedOperation] = useState('upload')

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
      const data = await listReceipts('')
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

  function handleValidated(data) {
    // Refresh receipts after validation
    loadReceipts()
  }

  function handleProcessed(data) {
    // Refresh receipts after processing
    loadReceipts()
  }

  function renderOperationPanel() {
    switch (selectedOperation) {
      case 'upload':
        return <UploadForm onUploaded={handleUploaded} />
      case 'validate':
        return <ValidateForm onValidated={handleValidated} />
      case 'process':
        return <ProcessForm onProcessed={handleProcessed} />
      case 'get':
        return (
          <div className="operation-panel">
            <h2>Receipts List</h2>
            <SearchBar query={query} onChange={setQuery} />
            {loading ? (
              <div className="loading">Loading receipts...</div>
            ) : (
              <ReceiptsTable rows={filteredReceipts} />
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📊 Receipt Management System</h1>
        <p className="app-subtitle">Manage your receipts with ease</p>
      </header>

      <main className="app-main">
        <OperationSelector
          selectedOperation={selectedOperation}
          onOperationChange={setSelectedOperation}
        />

        {renderOperationPanel()}
      </main>
    </div>
  )
}

export default App
