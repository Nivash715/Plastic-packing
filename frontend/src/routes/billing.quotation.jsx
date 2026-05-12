// billing.quotation.jsx — Quotations & Orders (converted from TSX to JSX)
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Pill, Btn, Stat, Field, inputCls } from "@/components/PageHelpers";
import { Plus, X, Check, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/billing/quotation")({
  head: () => ({ meta: [{ title: "Quotation & Orders — BrushPack" }] }),
  component: Page,
});

const STATUSES = ["Draft", "Sent", "Pending", "Accepted", "Received"];

const tone = (s) => ({ Accepted: "success", Received: "success", Sent: "info", Pending: "warn", Draft: "muted" }[s] || "muted");

function Page() {
  const [activeTab, setActiveTab] = useState("all");
  const [isAdding, setIsAdding]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [records, setRecords]     = useState([]);

  const emptyNew  = { id: "", contractor: "", date: "", value: "", status: "Draft" };
  const [newEntry, setNewEntry]   = useState(emptyNew);
  const [editEntry, setEditEntry] = useState(emptyNew);

  useEffect(() => {
    fetch("http://localhost:8000/api/billing")
      .then((r) => r.json())
      .then(setRecords)
      .catch(() => {
        const stored = JSON.parse(localStorage.getItem("billingRecords") || "[]");
        setRecords(stored);
      });
  }, []);

  const persist = (updated) => {
    setRecords(updated);
    localStorage.setItem("billingRecords", JSON.stringify(updated));
  };

  const handleAdd = async () => {
    if (!newEntry.id || !newEntry.contractor) return;
    const record = { ...newEntry, value: Number(newEntry.value), type: "quote" };
    try {
      await fetch("http://localhost:8000/api/billing", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record),
      });
    } catch {}
    persist([record, ...records]);
    setIsAdding(false);
    setNewEntry(emptyNew);
  };

  const handleEdit = async () => {
    if (!editEntry.id || !editEntry.contractor) return;
    const record = { ...editEntry, value: Number(editEntry.value) };
    try {
      await fetch(`http://localhost:8000/api/billing/${editingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record),
      });
    } catch {}
    persist(records.map((r) => (r.id === editingId ? record : r)));
    setEditingId(null);
    setEditEntry(emptyNew);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try { await fetch(`http://localhost:8000/api/billing/${id}`, { method: "DELETE" }); } catch {}
    persist(records.filter((r) => r.id !== id));
  };

  const stats = [
    { label: "Accepted", value: records.filter((r) => r.status === "Accepted").length },
    { label: "Sent",     value: records.filter((r) => r.status === "Sent").length     },
    { label: "Pending",  value: records.filter((r) => r.status === "Pending").length  },
  ];

  const displayed = records.filter((r) => activeTab === "status" ? r.status !== "Draft" : true);

  return (
    <DashboardLayout title="Quotation" subtitle="Manage quotes and track order statuses.">
      {/* Overview cards */}
      <Section title="Quotation Overview">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => <Stat key={s.label} label={s.label} value={s.value} />)}
          <button
            onClick={() => setActiveTab((t) => (t === "status" ? "all" : "status"))}
            className={`flex flex-col items-start justify-between rounded-2xl border p-4 sm:p-5 transition-all text-left ${
              activeTab === "status"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-secondary/50 border-border"
            }`}
          >
            <span className="text-xs sm:text-sm font-medium opacity-80 uppercase tracking-wider">Order Tracking</span>
            <span className="mt-2 text-xl sm:text-3xl font-display font-semibold">STATUS</span>
          </button>
        </div>
      </Section>

      <div className="h-5 sm:h-6" />

      {/* Records table */}
      <Section
        title={activeTab === "status" ? "Order Tracking Status" : "All Quotations & Bills"}
        action={
          <Btn variant="accent" onClick={() => { setIsAdding(true); setEditingId(null); }}>
            <Plus className="h-4 w-4" /> New Quotation
          </Btn>
        }
      >
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 sm:px-6 py-3 text-primary">Order ID</th>
                <th className="px-4 sm:px-6 py-3">Contractor</th>
                <th className="px-4 sm:px-6 py-3">Date</th>
                <th className="px-4 sm:px-6 py-3">Amount</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Add row */}
              {isAdding && (
                <tr className="bg-secondary/20">
                  <td className="px-4 sm:px-6 py-2"><input className={inputCls} placeholder="Q-0106" value={newEntry.id} onChange={(e) => setNewEntry({ ...newEntry, id: e.target.value })} /></td>
                  <td className="px-4 sm:px-6 py-2"><input className={inputCls} placeholder="Contractor" value={newEntry.contractor} onChange={(e) => setNewEntry({ ...newEntry, contractor: e.target.value })} /></td>
                  <td className="px-4 sm:px-6 py-2"><input type="date" className={inputCls} value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} /></td>
                  <td className="px-4 sm:px-6 py-2"><input type="number" className={inputCls} placeholder="0" value={newEntry.value} onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })} /></td>
                  <td className="px-4 sm:px-6 py-2 text-muted-foreground text-xs">Draft</td>
                  <td className="px-4 sm:px-6 py-2">
                    <div className="flex gap-1 justify-end">
                      <Btn onClick={handleAdd}><Check className="h-4 w-4" /></Btn>
                      <Btn variant="ghost" onClick={() => setIsAdding(false)}><X className="h-4 w-4" /></Btn>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {displayed.map((r) =>
                editingId === r.id ? (
                  <tr key={r.id} className="bg-secondary/20">
                    <td className="px-4 sm:px-6 py-2"><input className={inputCls} value={editEntry.id} onChange={(e) => setEditEntry({ ...editEntry, id: e.target.value })} /></td>
                    <td className="px-4 sm:px-6 py-2"><input className={inputCls} value={editEntry.contractor} onChange={(e) => setEditEntry({ ...editEntry, contractor: e.target.value })} /></td>
                    <td className="px-4 sm:px-6 py-2"><input type="date" className={inputCls} value={editEntry.date} onChange={(e) => setEditEntry({ ...editEntry, date: e.target.value })} /></td>
                    <td className="px-4 sm:px-6 py-2"><input type="number" className={inputCls} value={editEntry.value} onChange={(e) => setEditEntry({ ...editEntry, value: e.target.value })} /></td>
                    <td className="px-4 sm:px-6 py-2">
                      <select className={inputCls} value={editEntry.status} onChange={(e) => setEditEntry({ ...editEntry, status: e.target.value })}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-2">
                      <div className="flex gap-1 justify-end">
                        <Btn onClick={handleEdit}><Check className="h-4 w-4" /></Btn>
                        <Btn variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Btn>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition">
                    <td className="px-4 sm:px-6 py-3 font-medium whitespace-nowrap">{r.id}</td>
                    <td className="px-4 sm:px-6 py-3">{r.contractor}</td>
                    <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap">{r.date}</td>
                    <td className="px-4 sm:px-6 py-3 font-medium whitespace-nowrap">₹{Number(r.value).toLocaleString("en-IN")}</td>
                    <td className="px-4 sm:px-6 py-3"><Pill tone={tone(r.status)}>{r.status}</Pill></td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => { setEditingId(r.id); setEditEntry(r); setIsAdding(false); }}
                          className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {displayed.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    No records. Click "New Quotation" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </DashboardLayout>
  );
}
