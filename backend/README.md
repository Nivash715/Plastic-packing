# BrushPack — FastAPI Backend

## Setup & Run

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (auto-reload on code changes)
uvicorn main:app --reload --port 8000
```

The API will be live at **http://localhost:8000**

Interactive API docs (Swagger UI): **http://localhost:8000/docs**

## API Endpoints

| Module | Method | Path | Description |
|---|---|---|---|
| Dashboard | GET | `/api/dashboard` | Aggregated KPIs |
| Contractors | GET | `/api/contractors` | List all contractors |
| Contractors | POST | `/api/contractors` | Add contractor |
| Contractors | PUT | `/api/contractors/{id}` | Update contractor |
| Contractors | DELETE | `/api/contractors/{id}` | Remove contractor |
| Workers | GET | `/api/workers` | List daily workers |
| Workers | POST | `/api/workers` | Add worker |
| Workers | PUT | `/api/workers/{id}` | Update / mark attendance |
| Workers | DELETE | `/api/workers/{id}` | Remove worker |
| Stock | GET | `/api/stock` | Full inventory |
| Stock | GET | `/api/stock/low` | Low-stock items only |
| Stock | POST | `/api/stock` | Add stock item |
| Stock | PUT | `/api/stock/{id}` | Update stock item |
| Stock | DELETE | `/api/stock/{id}` | Remove item |
| Production | GET | `/api/batches` | All production batches |
| Production | POST | `/api/batches` | Create batch entry |
| Production | PUT | `/api/batches/{id}` | Update batch |
| Production | DELETE | `/api/batches/{id}` | Delete batch |
| Billing | GET | `/api/billing` | All invoices & quotations |
| Billing | POST | `/api/billing` | Create billing record |
| Billing | PUT | `/api/billing/{id}` | Update record |
| Billing | DELETE | `/api/billing/{id}` | Delete record |

## Notes
- Data is stored **in-memory** — restarting the server resets to seed data.
- CORS is pre-configured for `localhost:5173` (Vite dev) and `localhost:3000`.
- To persist data, replace the lists in `data.py` with a real database (SQLite via SQLAlchemy is an easy next step).
