// contractor.add.jsx (converted from TSX to JSX)
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Field, inputCls, Btn } from "@/components/PageHelpers";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/contractor/add")({
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: "", area: "", workers: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.area.trim()) { setError("Name and area are required."); return; }
    setSaving(true);
    try {
      await apiRequest("/api/contractors", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          area: form.area.trim(),
          workers: Number(form.workers) || 0,
          amount:  Number(form.amount)  || 0,
          status: "Pending",
        }),
      });
      navigate({ to: "/contractor/salary" });
    } catch (err) {
      setError(err.message || "Unable to save contractor.");
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Add New Contractor" subtitle="Register a new contractor for the packing floor.">
      <div className="max-w-lg">
        <Section title="Contractor Details">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Contractor Name">
              <input
                required className={inputCls} placeholder="e.g. Suresh Pillai"
                value={form.name} onChange={set("name")}
              />
            </Field>
            <Field label="Line / Area">
              <input
                required className={inputCls} placeholder="e.g. Cardboard Packing"
                value={form.area} onChange={set("area")}
              />
            </Field>
            <Field label="Total Workers Managed">
              <input
                type="number" min="0" className={inputCls}
                value={form.workers} onChange={set("workers")}
              />
            </Field>
            <Field label="Monthly Amount Payable (₹)">
              <input
                type="number" min="0" className={inputCls}
                value={form.amount} onChange={set("amount")}
              />
            </Field>
            <div className="pt-3 flex flex-wrap gap-3">
              <Btn type="button" variant="ghost" onClick={() => navigate({ to: "/contractor/salary" })}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Contractor"}
              </Btn>
            </div>
          </form>
        </Section>
      </div>
    </DashboardLayout>
  );
}
