// billing.create.jsx — Create Invoice (converted from TSX to JSX)
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Field, inputCls, Btn } from "@/components/PageHelpers";
import { Plus, Trash2, Send, Save } from "lucide-react";

export const Route = createFileRoute("/billing/create")({
  head: () => ({ meta: [{ title: "Create Billing — BrushPack" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [invoiceNo, setInvoiceNo]           = useState("INV-2026-0184");
  const [date, setDate]                     = useState(new Date().toISOString().split("T")[0]);
  const [clientName, setClientName]         = useState("");
  const [gstin, setGstin]                   = useState("");
  const [address, setAddress]               = useState("");
  const [placeOfSupply, setPlaceOfSupply]   = useState("");
  const [saving, setSaving]                 = useState(false);
  const [items, setItems] = useState([
    { desc: "Round Tip 12mm — Cardboard Pack", qty: 2500, rate: 12 },
    { desc: "Flat Tip 18mm — Plastic Sleeve",  qty: 1800, rate: 9  },
  ]);

  const sub   = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const gst   = sub * 0.18;
  const total = sub + gst;

  const update = (idx, k, v) => {
    const next = [...items];
    next[idx] = { ...next[idx], [k]: k === "desc" ? v : Number(v) };
    setItems(next);
  };

  const addItem    = () => setItems((p) => [...p, { desc: "", qty: 0, rate: 0 }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const saveBill = async (status) => {
    setSaving(true);
    const bill = { id: invoiceNo, contractor: clientName, date, value: total, status, type: "bill" };
    try {
      await fetch("http://localhost:8000/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bill),
      });
    } catch {
      const existing = JSON.parse(localStorage.getItem("billingRecords") || "[]");
      localStorage.setItem("billingRecords", JSON.stringify([bill, ...existing]));
    } finally {
      setSaving(false);
    }
    navigate({ to: "/billing/quotation" });
  };

  return (
    <DashboardLayout title="Create Invoice" subtitle="Generate a new billing invoice for a client.">
      {/* Header section */}
      <Section title="Invoice Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Invoice No.">
            <input className={inputCls} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </Field>
          <Field label="Date">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Client Name">
            <input className={inputCls} placeholder="BrightBrush Co." value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </Field>
          <Field label="GSTIN">
            <input className={inputCls} placeholder="22AAAAA0000A1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} />
          </Field>
          <Field label="Place of Supply">
            <input className={inputCls} placeholder="Kerala" value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} />
          </Field>
          <Field label="Address">
            <input className={inputCls} placeholder="City, State" value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
        </div>
      </Section>

      <div className="h-5 sm:h-6" />

      {/* Line items */}
      <Section
        title="Line Items"
        action={<Btn variant="accent" onClick={addItem}><Plus className="h-4 w-4" /> Add Item</Btn>}
      >
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 sm:px-6 py-3 flex-1">Description</th>
                <th className="px-4 sm:px-6 py-3 w-28">Qty</th>
                <th className="px-4 sm:px-6 py-3 w-28">Rate (₹)</th>
                <th className="px-4 sm:px-6 py-3 w-32 text-right">Amount</th>
                <th className="px-4 sm:px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  <td className="px-4 sm:px-6 py-2">
                    <input className={inputCls} value={it.desc} onChange={(e) => update(idx, "desc", e.target.value)} />
                  </td>
                  <td className="px-4 sm:px-6 py-2">
                    <input type="number" min="0" className={inputCls} value={it.qty} onChange={(e) => update(idx, "qty", e.target.value)} />
                  </td>
                  <td className="px-4 sm:px-6 py-2">
                    <input type="number" min="0" className={inputCls} value={it.rate} onChange={(e) => update(idx, "rate", e.target.value)} />
                  </td>
                  <td className="px-4 sm:px-6 py-2 text-right font-medium whitespace-nowrap">
                    ₹{(it.qty * it.rate).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 sm:px-6 py-2 text-right">
                    <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive p-1 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{sub.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span className="font-medium">₹{gst.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-display text-lg">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <Btn variant="ghost" onClick={() => saveBill("Draft")} disabled={saving}>
            <Save className="h-4 w-4" /> Save Draft
          </Btn>
          <Btn onClick={() => saveBill("Sent")} disabled={saving}>
            <Send className="h-4 w-4" /> {saving ? "Saving…" : "Send Invoice"}
          </Btn>
        </div>
      </Section>
    </DashboardLayout>
  );
}
