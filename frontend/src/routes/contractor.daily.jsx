// contractor.daily.jsx — Daily Workers Salary (converted from TSX to JSX)
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Stat, Field, inputCls, Btn, Pill } from "@/components/PageHelpers";
import { UserPlus, Download, Trash2, Search } from "lucide-react";
import { apiRequest, downloadCsv, uniqueBy } from "@/lib/api";

export const Route = createFileRoute("/contractor/daily")({
  head: () => ({ meta: [{ title: "Daily Workers Salary — BrushPack" }] }),
  component: Page,
});

const seedWorkers = [
  { id: "w1",  emp_id: "EMP001", name: "Ravi Kumar",    role: "Packer",       hours: 8, rate: 80,  present: true  },
  { id: "w2",  emp_id: "EMP002", name: "Meena Devi",    role: "Sorter",       hours: 8, rate: 70,  present: true  },
  { id: "w3",  emp_id: "EMP003", name: "Arun Sinha",    role: "QC Inspector", hours: 8, rate: 100, present: true  },
  { id: "w4",  emp_id: "EMP004", name: "Latha Rao",     role: "Packer",       hours: 6, rate: 80,  present: true  },
  { id: "w5",  emp_id: "EMP005", name: "Vinod Pillai",  role: "Loader",       hours: 0, rate: 90,  present: false },
  { id: "w6",  emp_id: "EMP006", name: "Priya Nair",    role: "Helper",       hours: 8, rate: 65,  present: true  },
];

function Page() {
  const [workers, setWorkers]   = useState(() => uniqueBy(seedWorkers, workerKey));
  const [search, setSearch]     = useState("");
  const [quickEntry, setQuickEntry] = useState({ id: "", emp_id: "", name: "", role: "", hours: 8, rate: 0 });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest("/api/workers")
      .then((data) => setWorkers(uniqueBy(data, workerKey)))
      .catch(() => {/* keep seed */});
  }, []);

  const handleEmployeeSelect = (selectedEmpId) => {
    const w = workers.find((w) => w.emp_id === selectedEmpId);
    if (w) {
      setQuickEntry({ id: w.id, emp_id: w.emp_id, name: w.name, role: w.role, hours: 8, rate: w.rate });
    } else {
      setQuickEntry({ id: "", emp_id: "", name: "", role: "", hours: 8, rate: 0 });
    }
  };

  const handleMarkAttendance = async () => {
    if (!quickEntry.id) { alert("Please select an Employee ID first."); return; }
    setError("");
    setSaving(true);
    const payload = {
      emp_id: quickEntry.emp_id, name: quickEntry.name, role: quickEntry.role,
      hours: Number(quickEntry.hours), rate: Number(quickEntry.rate), present: true,
    };
    try {
      const updated = await apiRequest(`/api/workers/${quickEntry.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setWorkers((prev) => uniqueBy(prev.map((w) => w.id === quickEntry.id ? updated : w), workerKey));
      setQuickEntry({ id: "", emp_id: "", name: "", role: "", hours: 8, rate: 0 });
    } catch (err) {
      setError(err.message || "Unable to mark attendance.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    setError("");
    try {
      await apiRequest(`/api/workers/${id}`, { method: "DELETE" });
      setWorkers((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err.message || "Unable to delete worker.");
    }
  };

  const handleExport = () => {
    downloadCsv(
      "daily-workers.csv",
      filtered.map((w) => ({
        emp_id: w.emp_id,
        name: w.name,
        role: w.role,
        hours: w.hours,
        rate: w.rate,
        total: w.hours * w.rate,
        status: w.present ? "Present" : "Absent",
      })),
    );
  };

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.emp_id.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase()),
  );

  const presentCount = workers.filter((w) => w.present).length;
  const totalWage    = workers.filter((w) => w.present).reduce((s, w) => s + w.hours * w.rate, 0);

  return (
    <DashboardLayout title="Daily Workers Salary" subtitle="Attendance tracking and daily wage calculation.">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Stat label="Workers Present" value={`${presentCount} / ${workers.length}`} hint="Today" />
        <Stat label="Total Daily Wage" value={`₹${totalWage.toLocaleString("en-IN")}`} hint="Present workers" />
        <Stat label="Absent" value={`${workers.length - presentCount}`} hint="Not clocked in" />
      </div>

      {/* Quick Entry */}
      <Section title="Quick Attendance Entry">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Field label="Employee ID">
            <select
              className={inputCls}
              value={quickEntry.emp_id}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
            >
              <option value="">Select ID…</option>
              {workers.map((w) => (
                <option key={w.id} value={w.emp_id}>{w.emp_id} — {w.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Name">
            <input readOnly className={inputCls + " bg-secondary/40"} value={quickEntry.name} placeholder="Auto-filled" />
          </Field>
          <Field label="Role">
            <input readOnly className={inputCls + " bg-secondary/40"} value={quickEntry.role} placeholder="Auto-filled" />
          </Field>
          <Field label="Hours Worked">
            <input
              type="number" min="0" max="12" step="0.5"
              className={inputCls}
              value={quickEntry.hours}
              onChange={(e) => setQuickEntry({ ...quickEntry, hours: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Btn onClick={handleMarkAttendance} disabled={!quickEntry.id || saving}>
            <UserPlus className="h-4 w-4" /> {saving ? "Saving..." : "Mark Present"}
          </Btn>
          <Link to="/contractor/workers/add">
            <Btn variant="accent"><UserPlus className="h-4 w-4" /> Add New Worker</Btn>
          </Link>
        </div>
      </Section>

      <div className="h-5 sm:h-6" />

      {/* Table */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search workers…"
            className={`${inputCls} pl-9 w-full sm:w-64`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Btn variant="ghost" onClick={handleExport} disabled={filtered.length === 0}>
          <Download className="h-4 w-4" /> Export
        </Btn>
      </div>

      <Section title="Workers">
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 sm:px-6 py-3">Emp ID</th>
                <th className="px-4 sm:px-6 py-3">Name</th>
                <th className="px-4 sm:px-6 py-3">Role</th>
                <th className="px-4 sm:px-6 py-3">Hours</th>
                <th className="px-4 sm:px-6 py-3">Rate / hr</th>
                <th className="px-4 sm:px-6 py-3">Total</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition">
                  <td className="px-4 sm:px-6 py-3 font-medium text-xs text-muted-foreground">{w.emp_id}</td>
                  <td className="px-4 sm:px-6 py-3 font-medium whitespace-nowrap">{w.name}</td>
                  <td className="px-4 sm:px-6 py-3 text-muted-foreground whitespace-nowrap">{w.role}</td>
                  <td className="px-4 sm:px-6 py-3">{w.hours}</td>
                  <td className="px-4 sm:px-6 py-3">₹{w.rate}</td>
                  <td className="px-4 sm:px-6 py-3 font-medium">₹{(w.hours * w.rate).toLocaleString("en-IN")}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <Pill tone={w.present ? "success" : "warn"}>{w.present ? "Present" : "Absent"}</Pill>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <button onClick={() => handleDelete(w.id)} className="text-muted-foreground hover:text-destructive transition p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground text-sm">No workers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </DashboardLayout>
  );
}

function workerKey(row) {
  return row.emp_id.trim().toLowerCase();
}
