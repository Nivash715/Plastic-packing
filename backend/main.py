"""
BrushPack — FastAPI Backend
Run:  uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import (
    Contractor, ContractorCreate,
    Worker, WorkerCreate,
    StockItem, StockItemCreate,
    Batch, BatchCreate,
    BillingRecord, BillingRecordCreate,
    DashboardSummary,
)
import data as db

app = FastAPI(
    title="BrushPack API",
    description="Backend API for BrushPack brush-tip packaging operations",
    version="1.0.0",
)

# ── CORS — allow Vite dev server ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/api/dashboard", response_model=DashboardSummary, tags=["Dashboard"])
def get_dashboard():
    """Aggregated KPIs for the main dashboard."""
    present = sum(1 for w in db.workers if w["present"])
    total   = len(db.workers)
    packed  = sum(b["output"] for b in db.batches)
    pending = [r for r in db.billing_records if r["status"] in ("Sent", "Pending", "Draft")]
    pending_value = sum(r["value"] for r in pending)
    low_stock = [s for s in db.stock_items if s["qty"] < s["min"]]
    return DashboardSummary(
        units_packed_today=packed,
        workers_present=present,
        workers_total=total,
        pending_bills=len(pending),
        pending_bills_value=pending_value,
        low_stock_count=len(low_stock),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# CONTRACTORS
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/api/contractors", response_model=List[Contractor], tags=["Contractors"])
def list_contractors():
    db.remove_duplicates()
    return db.contractors


@app.get("/api/contractors/{contractor_id}", response_model=Contractor, tags=["Contractors"])
def get_contractor(contractor_id: str):
    for c in db.contractors:
        if c["id"] == contractor_id:
            return c
    raise HTTPException(status_code=404, detail="Contractor not found")


@app.post("/api/contractors", response_model=Contractor, status_code=status.HTTP_201_CREATED, tags=["Contractors"])
def create_contractor(body: ContractorCreate):
    db.remove_duplicates()
    if any(
        c["name"].strip().lower() == body.name.strip().lower()
        and c["area"].strip().lower() == body.area.strip().lower()
        for c in db.contractors
    ):
        raise HTTPException(status_code=409, detail="Contractor already exists for this area")
    new = {"id": db.next_id("contractor"), **body.model_dump()}
    db.contractors.append(new)
    db.save_data()
    return new


@app.put("/api/contractors/{contractor_id}", response_model=Contractor, tags=["Contractors"])
def update_contractor(contractor_id: str, body: ContractorCreate):
    for i, c in enumerate(db.contractors):
        if c["id"] == contractor_id:
            db.contractors[i] = {"id": contractor_id, **body.model_dump()}
            db.save_data()
            return db.contractors[i]
    raise HTTPException(status_code=404, detail="Contractor not found")


@app.patch("/api/contractors/{contractor_id}/status", response_model=Contractor, tags=["Contractors"])
def update_contractor_status(contractor_id: str, status_value: str):
    for i, c in enumerate(db.contractors):
        if c["id"] == contractor_id:
            db.contractors[i]["status"] = status_value
            db.save_data()
            return db.contractors[i]
    raise HTTPException(status_code=404, detail="Contractor not found")


@app.delete("/api/contractors/{contractor_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Contractors"])
def delete_contractor(contractor_id: str):
    for i, c in enumerate(db.contractors):
        if c["id"] == contractor_id:
            db.contractors.pop(i)
            db.save_data()
            return
    raise HTTPException(status_code=404, detail="Contractor not found")


# ═══════════════════════════════════════════════════════════════════════════════
# DAILY WORKERS
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/api/workers", response_model=List[Worker], tags=["Workers"])
def list_workers():
    db.remove_duplicates()
    return db.workers


@app.get("/api/workers/{worker_id}", response_model=Worker, tags=["Workers"])
def get_worker(worker_id: str):
    for w in db.workers:
        if w["id"] == worker_id:
            return w
    raise HTTPException(status_code=404, detail="Worker not found")


@app.post("/api/workers", response_model=Worker, status_code=status.HTTP_201_CREATED, tags=["Workers"])
def create_worker(body: WorkerCreate):
    db.remove_duplicates()
    # Check for duplicate emp_id
    if any(w["emp_id"] == body.emp_id for w in db.workers):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    new = {"id": db.next_id("worker"), **body.model_dump()}
    db.workers.append(new)
    db.save_data()
    return new


@app.put("/api/workers/{worker_id}", response_model=Worker, tags=["Workers"])
def update_worker(worker_id: str, body: WorkerCreate):
    if any(w["id"] != worker_id and w["emp_id"] == body.emp_id for w in db.workers):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    for i, w in enumerate(db.workers):
        if w["id"] == worker_id:
            db.workers[i] = {"id": worker_id, **body.model_dump()}
            db.save_data()
            return db.workers[i]
    raise HTTPException(status_code=404, detail="Worker not found")


@app.delete("/api/workers/{worker_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Workers"])
def delete_worker(worker_id: str):
    for i, w in enumerate(db.workers):
        if w["id"] == worker_id:
            db.workers.pop(i)
            db.save_data()
            return
    raise HTTPException(status_code=404, detail="Worker not found")


# ═══════════════════════════════════════════════════════════════════════════════
# INVENTORY / STOCK
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/api/stock", response_model=List[StockItem], tags=["Inventory"])
def list_stock():
    return db.stock_items


@app.get("/api/stock/low", response_model=List[StockItem], tags=["Inventory"])
def list_low_stock():
    """Returns items whose qty is below their minimum threshold."""
    return [s for s in db.stock_items if s["qty"] < s["min"]]


@app.get("/api/stock/{item_id}", response_model=StockItem, tags=["Inventory"])
def get_stock_item(item_id: str):
    for s in db.stock_items:
        if s["id"] == item_id:
            return s
    raise HTTPException(status_code=404, detail="Stock item not found")


@app.post("/api/stock", response_model=StockItem, status_code=status.HTTP_201_CREATED, tags=["Inventory"])
def create_stock_item(body: StockItemCreate):
    new = {"id": db.next_id("stock"), **body.model_dump()}
    db.stock_items.append(new)
    db.save_data()
    return new


@app.put("/api/stock/{item_id}", response_model=StockItem, tags=["Inventory"])
def update_stock_item(item_id: str, body: StockItemCreate):
    for i, s in enumerate(db.stock_items):
        if s["id"] == item_id:
            db.stock_items[i] = {"id": item_id, **body.model_dump()}
            db.save_data()
            return db.stock_items[i]
    raise HTTPException(status_code=404, detail="Stock item not found")


@app.delete("/api/stock/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Inventory"])
def delete_stock_item(item_id: str):
    for i, s in enumerate(db.stock_items):
        if s["id"] == item_id:
            db.stock_items.pop(i)
            db.save_data()
            return
    raise HTTPException(status_code=404, detail="Stock item not found")


# ═══════════════════════════════════════════════════════════════════════════════
# PRODUCTION BATCHES
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/api/batches", response_model=List[Batch], tags=["Production"])
def list_batches():
    return db.batches


@app.get("/api/batches/{batch_id}", response_model=Batch, tags=["Production"])
def get_batch(batch_id: str):
    for b in db.batches:
        if b["id"] == batch_id:
            return b
    raise HTTPException(status_code=404, detail="Batch not found")


@app.post("/api/batches", response_model=Batch, status_code=status.HTTP_201_CREATED, tags=["Production"])
def create_batch(body: BatchCreate):
    # Prevent duplicate batch numbers
    if any(b["batch"] == body.batch for b in db.batches):
        raise HTTPException(status_code=409, detail="Batch number already exists")
    new = {"id": db.next_id("batch"), **body.model_dump()}
    db.batches.append(new)
    db.save_data()
    return new


@app.put("/api/batches/{batch_id}", response_model=Batch, tags=["Production"])
def update_batch(batch_id: str, body: BatchCreate):
    for i, b in enumerate(db.batches):
        if b["id"] == batch_id:
            db.batches[i] = {"id": batch_id, **body.model_dump()}
            db.save_data()
            return db.batches[i]
    raise HTTPException(status_code=404, detail="Batch not found")


@app.delete("/api/batches/{batch_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Production"])
def delete_batch(batch_id: str):
    for i, b in enumerate(db.batches):
        if b["id"] == batch_id:
            db.batches.pop(i)
            db.save_data()
            return
    raise HTTPException(status_code=404, detail="Batch not found")


# ═══════════════════════════════════════════════════════════════════════════════
# BILLING & QUOTATIONS
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/api/billing", response_model=List[BillingRecord], tags=["Billing"])
def list_billing():
    return db.billing_records


@app.get("/api/billing/{record_id}", response_model=BillingRecord, tags=["Billing"])
def get_billing(record_id: str):
    for r in db.billing_records:
        if r["id"] == record_id:
            return r
    raise HTTPException(status_code=404, detail="Billing record not found")


@app.post("/api/billing", response_model=BillingRecord, status_code=status.HTTP_201_CREATED, tags=["Billing"])
def create_billing(body: BillingRecordCreate):
    if any(r["id"] == body.id for r in db.billing_records):
        raise HTTPException(status_code=409, detail="Record ID already exists")
    new = body.model_dump()
    db.billing_records.insert(0, new)
    db.save_data()
    return new


@app.put("/api/billing/{record_id}", response_model=BillingRecord, tags=["Billing"])
def update_billing(record_id: str, body: BillingRecordCreate):
    for i, r in enumerate(db.billing_records):
        if r["id"] == record_id:
            db.billing_records[i] = body.model_dump()
            db.save_data()
            return db.billing_records[i]
    raise HTTPException(status_code=404, detail="Billing record not found")


@app.delete("/api/billing/{record_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Billing"])
def delete_billing(record_id: str):
    for i, r in enumerate(db.billing_records):
        if r["id"] == record_id:
            db.billing_records.pop(i)
            db.save_data()
            return
    raise HTTPException(status_code=404, detail="Billing record not found")


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════════
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "BrushPack API"}
