# automated_accounts_frontend_app

React + Vite frontend for a Receipt Management UI that uploads, validates, processes, lists, and views receipt details backed by a REST API.

## 1. React JSON Display UI

The app provides a simple panel-based UI to perform operations against receipts:

- Upload a PDF receipt
- Validate a receipt PDF
- Process a receipt PDF and display parsed fields
- List receipts with search and view details in a modal

Key screens/components:
- `OperationSelector` dropdown to switch between Upload / Validate / Process / Get
- `UploadForm`, `ValidateForm`, `ProcessForm` for respective actions
- `ReceiptsTable` for tabular list view with search
- `Modal` detail view renders receipt fields and items in a readable JSON-like layout

## 2. Features in this App

- Receipt CRUD (read-only list and detail from backend)
- PDF file upload using `multipart/form-data`
- Client-side success/error handling with clear messages
- Search across merchant, date, amount, and created timestamp
- Currency formatting via Intl APIs
- Modal-based receipt details with itemized breakdown

## 3. Configure in local

Prerequisites:
- Node.js 18+ recommended
- npm (or yarn/pnpm)

Install and run the frontend:
```bash
npm install
npm run dev
```

Optional combined run (if you have the backend in `server/` per scripts):
```bash
npm run dev:all
```

Build and preview:
```bash
npm run build
npm run preview
```

The app expects an API running at `http://localhost:3002/api`. You can change this in `src/api/client.js` by editing `apiUrl`.

## 4. Env details

- Framework: React 19 (via Vite)
- Dev server: Vite (default port 5173 unless occupied)
- API base URL: `http://localhost:3002/api` (hardcoded in `src/api/client.js`)
- No `.env` is required for the frontend by default. If desired, create `VITE_API_URL` and wire it into `src/api/client.js`.

Key scripts in `package.json`:
- `dev`: starts Vite dev server
- `build`: builds for production
- `preview`: previews the production build
- `dev:all`: runs Vite and an example backend concurrently (if present)

## 5. Api Information

Base URL: `http://localhost:3002/api`

Endpoints used by the frontend (see `src/api/receipts.js`):
- `GET /receipts/list-receipts`
  - Query: `q` (optional search text)
  - Returns list of receipts
- `POST /receipts/upload` (multipart/form-data)
  - Body: `file` (PDF)
  - Uploads a new receipt document
- `POST /receipts/validate` (multipart/form-data)
  - Body: `file` (PDF)
  - Validates receipt file
- `POST /receipts/process` (multipart/form-data)
  - Body: `file` (PDF)
  - Processes and extracts fields
- `GET /receipts/get-receipt-detail/:receiptId`
  - Path param: `receiptId`
  - Returns full details of a receipt

Axios client behavior (`src/api/client.js`):
- Base URL set to `http://localhost:3002/api`
- JSON headers by default; form uploads override to `multipart/form-data`
- Response interceptor normalizes errors to a single `Error(message)`

## 6. Response information

Examples (shape may vary based on backend):

- List receipts
```json
{
  "receiptsArray": [
    {
      "_id": "65f...",
      "merchant_name": "Store A",
      "purchased_at": "2024-04-01",
      "total_amount": 23.45,
      "createdAt": "2024-04-02T10:20:30.000Z"
    }
  ]
}
```

- Validate receipt
```json
{
  "isValid": true,
  "message": "Receipt is valid"
}
```

- Process receipt
```json
{
  "isProcessed": true,
  "message": "Receipt processed successfully",
  "result": {
    "merchant_name": "Store A",
    "receipt_date": "2024-04-01",
    "amount": 23.45
  }
}
```

- Receipt details
```json
{
  "receiptDetails": {
    "_id": "65f...",
    "merchant_name": "Store A",
    "purchased_at": "2024-04-01",
    "total_amount": 23.45,
    "items": [
      {
        "description": "Item 1",
        "quantity": 1,
        "unit_price": 23.45,
        "amount": 23.45
      }
    ],
    "createdAt": "2024-04-02T10:20:30.000Z"
  }
}
```

Error shape (normalized by Axios interceptor):
```txt
Error: <message from response.data.error | response.data.message | error.message>
```

## 7. Integration details

- Ensure your backend implements the endpoints above and serves CORS to `http://localhost:5173` (or your dev port).
- PDF uploads must be accepted as `multipart/form-data` with `file` field.
- If your backend path differs, update `apiUrl` in `src/api/client.js` or introduce an env var (e.g., `VITE_API_URL`) and import it via `import.meta.env.VITE_API_URL`.
- The UI expects fields like `merchant_name`, `purchased_at`/`receipt_date`, `total_amount`/`amount`, and an `items`/`line_items` array for details.

## 8. Brief about project in docs

This project is a lightweight React/Vite frontend for managing receipt documents. It focuses on a clean workflow for PDF ingestion: upload → validate → process → browse → inspect. The UI intentionally presents server responses in a JSON-like, readable layout to aid debugging and integrations. Swap the base API URL to point to your environment, and the app will operate against your backend with minimal changes.
