"""
Small JSON-backed data store for BrushPack.
The app keeps data in memory while running and writes each mutation to disk.
"""

import json
from pathlib import Path

DATA_FILE = Path(__file__).with_name("brushpack_data.json")

contractors = [
    {"id": "c1", "name": "Suresh Pillai",   "area": "Cardboard Packing",  "workers": 22, "amount": 68000, "status": "Paid"},
    {"id": "c2", "name": "Rekha Menon",     "area": "Plastic Sleeve Line", "workers": 18, "amount": 55000, "status": "Pending"},
    {"id": "c3", "name": "Arjun Nair",      "area": "Blister Pack",        "workers": 14, "amount": 44000, "status": "Paid"},
    {"id": "c4", "name": "Divya Thomas",    "area": "QC & Dispatch",       "workers": 16, "amount": 51000, "status": "Pending"},
    {"id": "c5", "name": "Biju Varghese",   "area": "Labelling",           "workers": 12, "amount": 39000, "status": "Paid"},
]

workers = [
    {"id": "w1",  "emp_id": "EMP001", "name": "Ravi Kumar",    "role": "Packer",       "hours": 8,  "rate": 80,  "present": True},
    {"id": "w2",  "emp_id": "EMP002", "name": "Meena Devi",    "role": "Sorter",       "hours": 8,  "rate": 70,  "present": True},
    {"id": "w3",  "emp_id": "EMP003", "name": "Arun Sinha",    "role": "QC Inspector", "hours": 8,  "rate": 100, "present": True},
    {"id": "w4",  "emp_id": "EMP004", "name": "Latha Rao",     "role": "Packer",       "hours": 6,  "rate": 80,  "present": True},
    {"id": "w5",  "emp_id": "EMP005", "name": "Vinod Pillai",  "role": "Loader",       "hours": 8,  "rate": 90,  "present": False},
    {"id": "w6",  "emp_id": "EMP006", "name": "Priya Nair",    "role": "Helper",       "hours": 8,  "rate": 65,  "present": True},
    {"id": "w7",  "emp_id": "EMP007", "name": "Sajeev Menon",  "role": "Sorter",       "hours": 4,  "rate": 70,  "present": True},
    {"id": "w8",  "emp_id": "EMP008", "name": "Geetha Anand",  "role": "Packer",       "hours": 8,  "rate": 80,  "present": False},
    {"id": "w9",  "emp_id": "EMP009", "name": "Tharun Das",    "role": "Loader",       "hours": 8,  "rate": 90,  "present": True},
    {"id": "w10", "emp_id": "EMP010", "name": "Anitha Suresh", "role": "QC Inspector", "hours": 8,  "rate": 100, "present": True},
]

stock_items = [
    {"id": "s1", "name": "Cardboard Sheets - A4",        "cat": "Cardboard", "qty": 4200,  "unit": "sheets", "min": 2000},
    {"id": "s2", "name": "Cardboard Boxes - Small",      "cat": "Cardboard", "qty": 1100,  "unit": "pcs",    "min": 1500},
    {"id": "s3", "name": "Plastic Sleeves - Clear 12mm", "cat": "Plastic",   "qty": 8400,  "unit": "pcs",    "min": 3000},
    {"id": "s4", "name": "Blister Cards - 18mm",         "cat": "Plastic",   "qty": 920,   "unit": "pcs",    "min": 1500},
    {"id": "s5", "name": "Printed Labels (Roll)",        "cat": "Supplies",  "qty": 32,    "unit": "rolls",  "min": 20},
    {"id": "s6", "name": "Sealing Tape - 48mm",          "cat": "Supplies",  "qty": 14,    "unit": "rolls",  "min": 30},
    {"id": "s7", "name": "Hot Glue Sticks",              "cat": "Supplies",  "qty": 540,   "unit": "pcs",    "min": 200},
]

batches = [
    {"id": "b1", "batch": "PK-2381", "product": "Round Tip 12mm — Cardboard",      "input": 2500, "output": 2480},
    {"id": "b2", "batch": "PK-2380", "product": "Flat Tip 18mm — Plastic Sleeve",  "input": 1800, "output": 1792},
    {"id": "b3", "batch": "PK-2379", "product": "Angled Tip 10mm — Blister Pack",  "input": 3200, "output": 3168},
    {"id": "b4", "batch": "PK-2378", "product": "Detail Tip 6mm — Cardboard Box",  "input": 1600, "output": 1590},
]

billing_records = [
    {"id": "INV-2026-0184", "contractor": "BrightBrush Co.",   "date": "2026-05-09", "value": 354000, "status": "Sent",    "type": "bill"},
    {"id": "INV-2026-0183", "contractor": "ArtPro Supplies",   "date": "2026-05-07", "value": 212000, "status": "Paid",    "type": "bill"},
    {"id": "Q-0105",        "contractor": "Studio Mart",        "date": "2026-05-05", "value": 480000, "status": "Pending", "type": "quote"},
    {"id": "Q-0104",        "contractor": "BrightBrush Co.",   "date": "2026-05-01", "value": 320000, "status": "Accepted","type": "quote"},
    {"id": "INV-2026-0182", "contractor": "ColorWorks",         "date": "2026-04-28", "value": 188000, "status": "Paid",    "type": "bill"},
]

_id_counters = {}

_PREFIXES = {
    "contractor": "c",
    "worker": "w",
    "stock": "s",
    "batch": "b",
}

_STORE_KEYS = {
    "contractors": contractors,
    "workers": workers,
    "stock_items": stock_items,
    "batches": batches,
    "billing_records": billing_records,
}


def _next_number(items: list[dict], prefix: str) -> int:
    numbers = []
    for item in items:
        item_id = str(item.get("id", ""))
        if item_id.startswith(prefix) and item_id[len(prefix):].isdigit():
            numbers.append(int(item_id[len(prefix):]))
    return max(numbers, default=0) + 1


def _sync_counters() -> None:
    _id_counters.update(
        {
            "contractor": _next_number(contractors, "c"),
            "worker": _next_number(workers, "w"),
            "stock": _next_number(stock_items, "s"),
            "batch": _next_number(batches, "b"),
        }
    )


def _dedupe(items: list[dict], key_fn) -> bool:
    seen = set()
    unique = []
    changed = False

    for item in items:
        key = key_fn(item)
        if key in seen:
            changed = True
            continue
        seen.add(key)
        unique.append(item)

    if changed:
        items.clear()
        items.extend(unique)

    return changed


def remove_duplicates() -> bool:
    changed = False
    changed |= _dedupe(
        contractors,
        lambda item: (
            str(item.get("name", "")).strip().lower(),
            str(item.get("area", "")).strip().lower(),
        ),
    )
    changed |= _dedupe(workers, lambda item: str(item.get("emp_id", "")).strip().lower())
    changed |= _dedupe(batches, lambda item: str(item.get("batch", "")).strip().lower())
    changed |= _dedupe(billing_records, lambda item: str(item.get("id", "")).strip().lower())

    if changed:
        _sync_counters()
        save_data()

    return changed


def load_data() -> None:
    if not DATA_FILE.exists():
        _sync_counters()
        return

    with DATA_FILE.open("r", encoding="utf-8") as handle:
        saved = json.load(handle)

    for key, target in _STORE_KEYS.items():
        if isinstance(saved.get(key), list):
            target.clear()
            target.extend(saved[key])

    _sync_counters()
    remove_duplicates()


def save_data() -> None:
    payload = {key: value for key, value in _STORE_KEYS.items()}
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)


def next_id(kind: str) -> str:
    number = _id_counters[kind]
    _id_counters[kind] += 1
    return f"{_PREFIXES[kind]}{number}"


load_data()
