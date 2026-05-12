// contractor.salary.jsx (converted from TSX to JSX)
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Stat, Pill, Btn, inputCls } from "@/components/PageHelpers";
import { Download, Plus, Search } from "lucide-react";
import { apiRequest, downloadCsv, uniqueBy } from "@/lib/api";

export const Route = createFileRoute("/contractor/salary")({
  head: () => ({ meta: [{ title: "Contractor Salary — BrushPack" }] }),
  component: Page,
});

const seedRows = [
  { id: "c1", name: "Suresh Pillai",  area: "Cardboard Packing",   workers: 22, amount: 68000, status: "Paid"    },
  { id: "c2", name: "Rekha Menon",    area: "Plastic Sleeve Line",  workers: 18, amount: 55000, status: "Pending" },
  { id: "c3", name: "Arjun Nair",     area: "Blister Pack",         workers: 14, amount: 44000, status: "Paid"    },
  { id: "c4", name: "Divya Thomas",   area: "QC & Dispatch",        workers: 16, amount: 51000, status: "Pending" },
  { id: "c5", name: "Biju Varghese",  area: "Labelling",            workers: 12, amount: 39000, status: "Paid"    },
];

function Page() {
  const [rows, setRows]     = useState(() => uniqueBy(seedRows, contractorKey));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    setLoading(true);
    apiRequest("/api/contractors")
      .then((data) => setRows(uniqueBy(data, contractorKey)))
      .catch(() => {/* keep seed data */})
      .finally(() => setLoading(false));
  }, []);

  const markPaid = async (id) => {
    setError("");
    setSavingId(id);
    try {
      const updated = await apiRequest(`/api/contractors/${id}/status?status_value=Paid`, { method: "PATCH" });
      setRows((prev) => uniqueBy(prev.map((r) => r.id === id ? updated : r), contractorKey));
    } catch (err) {
      setError(err.message || "Unable to mark contractor as paid.");
    } finally {
      setSavingId("");
    }
  };

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.area.toLowerCase().includes(search.toLowerCase()),
  );

  const total   = rows.reduce((s, r) => s + r.amount, 0);
  const paid    = rows.filter((r) => r.status === "Paid").reduce((s, r) => s + r.amount, 0);
  const pending = total - paid;
  const handleExport = () => {
    downloadCsv(
      "contractor-salary.csv",
      filtered.map((r) => ({
        name: r.name,
        area: r.area,
        workers: r.workers,
        amount: r.amount,
        status: r.status,
      })),
    );
  };

  return (
    <DashboardLayout title="Contractor Salary" subtitle="Monthly payouts to area contractors managing the packing lines.">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Stat label="Total Payable" value={`₹${total.toLocaleString("en-IN")}`} hint="May 2026" />
        <Stat label="Paid"          value={`₹${paid.toLocaleString("en-IN")}`}  hint={`${rows.filter(r => r.status === "Paid").length} contractors`} />
        <Stat label="Pending"       value={`₹${pending.toLocaleString("en-IN")}`} hint={`${rows.filter(r => r.status === "Pending").length} contractors`} />
      </div>

      {/* Controls */}
      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contractor or area…"
            className={`${inputCls} pl-9 w-full sm:w-72`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link to="/contractor/add">
          <Btn variant="accent"><Plus className="h-4 w-4" /> Add Contractor</Btn>
        </Link>
      </div>

      {/* Table */}
      <Section
        title="Contractors"
        action={
          <Btn variant="ghost" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" /> Export
          </Btn>
        }
      >
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-4 sm:px-6 py-3">Contractor</th>
                  <th className="px-4 sm:px-6 py-3">Line / Area</th>
                  <th className="px-4 sm:px-6 py-3">Workers</th>
                  <th className="px-4 sm:px-6 py-3">Amount</th>
                  <th className="px-4 sm:px-6 py-3">Status</th>
                  <th className="px-4 sm:px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition">
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-warm grid place-items-center text-accent-foreground text-xs font-medium shrink-0">
                          {r.name[0]}
                        </div>
                        <span className="font-medium truncate">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap">{r.area}</td>
                    <td className="px-4 sm:px-6 py-3">{r.workers}</td>
                    <td className="px-4 sm:px-6 py-3 font-medium whitespace-nowrap">₹{r.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <Pill tone={r.status === "Paid" ? "success" : "warn"}>{r.status}</Pill>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      {r.status !== "Paid" && (
                        <Btn variant="ghost" className="text-xs" onClick={() => markPaid(r.id)} disabled={savingId === r.id}>
                          {savingId === r.id ? "Saving..." : "Mark Paid"}
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground text-sm">
                      No contractors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </DashboardLayout>
  );
}

function contractorKey(row) {
  return `${row.name.trim().toLowerCase()}|${row.area.trim().toLowerCase()}`;
}
