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


function ProcessComponentUI({ responseData, messageType }) {

  if (messageType !== 'green' || !responseData) return null;

  const { isProcessed, message, result } = responseData;

  return (
    <div className="json-display">
      <div className="row">
        <span className="label">Status:</span>
        <span className="value">{isProcessed ? 'true' : 'false'}</span>
      </div>
      <div className="row">
        <span className="label">Message:</span>
        <span className="value">{message}</span>
      </div>
      {result && (
        <>
          <div className="row">
            <span className="label">Merchant Name:</span>
            <span className="value">{result.merchant_name}</span>
          </div>
          <div className="row">
            <span className="label">Receipt Date:</span>
            <span className="value">{result.receipt_date}</span>
          </div>
          <div className="row">
            <span className="label">Amount:</span>
            <span className="value">{result.amount}</span>
          </div>
        </>
      )}
    </div>
  );
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
  const [messageType, setMessageType] = useState('green')
  const [responseData, setResponseData] = useState(null)
  const fileInputRef = useRef(null)

  console.log("messageType", messageType)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) return setError('Choose a PDF receipt to process')

    setBusy(true)

    try {
      const data = await processReceipt(file)
      if (data?.isProcessed) {
        setMessageType('green')
        setSuccess(data?.message || 'Receipt processed successfully!')
        setError('')
        setResponseData(data)
      } else {
        setMessageType('red')
        setError(data?.message || 'Processing failed')
        setSuccess('')
        setResponseData(null)
      }
      onProcessed?.(data)

      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setMessageType('red')
      setError(err.message || 'Processing failed')
      setSuccess('')
      setResponseData(null)
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
        {messageType === 'green' ? (
          success && <div className="success-message">{success}</div>
        ) : (
          error && <div className="error-message">{error}</div>
        )}
        {messageType === 'green' && responseData && (
          <>
            <ProcessComponentUI responseData={responseData} messageType={messageType} />

          </>
          // <pre className="json-output">{JSON.stringify(responseData, null, 2)}</pre>
        )}
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

function ReceiptsTable({ rows, onView, loadingId }) {
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
            <th>Action</th>
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
                <button
                  className="submit-btn submit-btn--sm"
                  onClick={() => onView?.(r._id)}
                  disabled={loadingId === r._id}
                >
                  {loadingId === r._id ? 'Loading...' : 'View'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [receipts, setReceipts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState('upload')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [viewLoadingId, setViewLoadingId] = useState(null)
  const [viewError, setViewError] = useState('')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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

  async function handleViewReceipt(id) {
    setViewError('')
    setViewLoadingId(id)
    try {
      const data = await getReceipt(id)
      // Support either { receipt: {...} } or direct object
      setSelectedReceipt(data?.receiptDetails || data || null)
      setIsDetailsOpen(true)
    } catch (err) {
      setViewError(err.message || 'Failed to fetch receipt')
      setSelectedReceipt(null)
    } finally {
      setViewLoadingId(null)
    }
  }

  function renderReceiptDetails() {
    if (!selectedReceipt) return null

    const receipt = selectedReceipt
    const items = Array.isArray(receipt.items) ? receipt.items : receipt.line_items

    return (
      <div className="json-display">
        <div className="row">
          <span className="label">ID:</span>
          <span className="value">{receipt._id || '-'}</span>
        </div>
        <div className="row">
          <span className="label">Merchant Name:</span>
          <span className="value">{receipt.merchant_name || '-'}</span>
        </div>
        <div className="row">
          <span className="label">Purchased Date:</span>
          <span className="value">{receipt.purchased_at || receipt.receipt_date || '-'}</span>
        </div>
        <div className="row">
          <span className="label">Total Amount:</span>
          <span className="value">{formatCurrency(receipt.total_amount ?? receipt.amount, 'CAD')}</span>
        </div>
        {items && items.length > 0 && (
          <div className="row">
            <span className="label">Items:</span>
            <span className="value" style={{ display: 'block', width: '100%' }}>
              <div className="table-container">
                <table className="receipts-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{it.description || it.name || '-'}</td>
                        <td>{it.quantity ?? it.qty ?? '-'}</td>
                        <td>{formatCurrency(it.unit_price ?? it.price, 'CAD')}</td>
                        <td>{formatCurrency(it.amount ?? it.total, 'CAD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </span>
          </div>
        )}
      </div>
    )
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
              <>
                <ReceiptsTable rows={filteredReceipts} onView={handleViewReceipt} loadingId={viewLoadingId} />
                {viewError && <div className="error-message" style={{ marginTop: 12 }}>{viewError}</div>}
              </>
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

      <Modal
        open={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); }}
        title="Receipt Details"
      >
        {renderReceiptDetails()}
      </Modal>
    </div>
  )
}

export default App
