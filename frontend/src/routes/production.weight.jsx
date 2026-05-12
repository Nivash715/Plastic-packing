// production.weight.jsx — Output Tracking (converted from TSX to JSX)
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Stat, Field, inputCls, Btn, Pill } from "@/components/PageHelpers";
import { Plus, PackageCheck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/production/weight")({
  head: () => ({ meta: [{ title: "Output Tracking — BrushPack" }] }),
  component: Page,
});

const seedRows = [
  { id: "b1", batch: "PK-2381", product: "Round Tip 12mm — Cardboard",     input: 2500, output: 2480 },
  { id: "b2", batch: "PK-2380", product: "Flat Tip 18mm — Plastic Sleeve", input: 1800, output: 1792 },
  { id: "b3", batch: "PK-2379", product: "Angled Tip 10mm — Blister Pack", input: 3200, output: 3168 },
  { id: "b4", batch: "PK-2378", product: "Detail Tip 6mm — Cardboard Box", input: 1600, output: 1590 },
];

function Page() {
  const [rows, setRows]     = useState(seedRows);
  const [batchNo, setBatch] = useState("");
  const [product, setProduct] = useState("");
  const [input, setInput]   = useState("");
  const [output, setOutput] = useState("");
  const [saving, setSaving] = useState(false);

  const inN  = parseFloat(input)  || 0;
  const outN = parseFloat(output) || 0;
  const remaining = Math.max(0, inN - outN);

  const totalReceived = rows.reduce((s, r) => s + r.input,  0);
  const totalPacked   = rows.reduce((s, r) => s + r.output, 0);
  const totalPending  = totalReceived - totalPacked;

  const saveEntry = async () => {
    if (!batchNo || !product || !input || !output) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchNo, product, input: inN, output: outN }),
      });
      if (res.ok) {
        const newRow = await res.json();
        setRows((prev) => [newRow, ...prev]);
        setBatch(""); setProduct(""); setInput(""); setOutput("");
      }
    } catch {
      // Backend unavailable — add locally
      const newRow = { id: Date.now().toString(), batch: batchNo, product, input: inN, output: outN };
      setRows((prev) => [newRow, ...prev]);
      setBatch(""); setProduct(""); setInput(""); setOutput("");
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id) => {
    if (!confirm("Delete this batch entry?")) return;
    try {
      await fetch(`http://localhost:8000/api/batches/${id}`, { method: "DELETE" });
    } catch {}
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <DashboardLayout title="Output Tracking" subtitle="Track received tips, packed units and remaining stock per batch.">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Stat label="Tips Received Today"  value={totalReceived.toLocaleString() + " units"} hint={`${rows.length} batches`} />
        <Stat label="Packed Today"         value={totalPacked.toLocaleString()   + " units"} hint="Sealed & labelled" />
        <Stat label="Remaining"            value={totalPending.toLocaleString()  + " units"} hint="Pending across batches" />
      </div>

      {/* Add form */}
      <Section
        title="Add Batch Output"
        action={<Btn variant="accent" onClick={saveEntry} disabled={saving}><Plus className="h-4 w-4" /> New Entry</Btn>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Field label="Batch No.">
            <input className={inputCls} placeholder="PK-2382" value={batchNo} onChange={(e) => setBatch(e.target.value)} />
          </Field>
          <Field label="Product / Pack Type">
            <input className={inputCls} placeholder="Round Tip 12mm — Cardboard" value={product} onChange={(e) => setProduct(e.target.value)} />
          </Field>
          <Field label="Tips Received (units)">
            <input type="number" min="0" className={inputCls} placeholder="0" value={input} onChange={(e) => setInput(e.target.value)} />
          </Field>
          <Field label="Packed Units">
            <input type="number" min="0" className={inputCls} placeholder="0" value={output} onChange={(e) => setOutput(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="rounded-lg bg-secondary/60 border border-border px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Remaining: </span>
            <span className="font-display text-base">{remaining.toFixed(0)} units</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Btn variant="ghost" onClick={() => { setBatch(""); setProduct(""); setInput(""); setOutput(""); }}>Reset</Btn>
            <Btn onClick={saveEntry} disabled={saving}>
              <PackageCheck className="h-4 w-4" /> {saving ? "Saving…" : "Save Entry"}
            </Btn>
          </div>
        </div>
      </Section>

      <div className="h-5 sm:h-6" />

      {/* Table */}
      <Section title="Recent Batches">
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 sm:px-6 py-3">Batch</th>
                <th className="px-4 sm:px-6 py-3">Product / Pack</th>
                <th className="px-4 sm:px-6 py-3">Received</th>
                <th className="px-4 sm:px-6 py-3">Packed</th>
                <th className="px-4 sm:px-6 py-3">Remaining</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const rem = r.input - r.output;
                return (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition">
                    <td className="px-4 sm:px-6 py-3 font-medium whitespace-nowrap">{r.batch}</td>
                    <td className="px-4 sm:px-6 py-3 text-muted-foreground">{r.product}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.input.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.output.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{rem.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <Pill tone={rem === 0 ? "success" : "warn"}>{rem === 0 ? "Completed" : "Pending"}</Pill>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <button onClick={() => deleteRow(r.id)} className="text-muted-foreground hover:text-destructive transition p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </DashboardLayout>
  );
}
