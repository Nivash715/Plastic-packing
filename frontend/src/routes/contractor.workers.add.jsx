// contractor.workers.add.jsx (converted from TSX to JSX)
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Field, inputCls, Btn } from "@/components/PageHelpers";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/contractor/workers/add")({
  component: Page,
});

const ROLES = ["Sorter", "Packer", "QC Inspector", "Loader", "Helper"];

function Page() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ emp_id: "", name: "", role: "Sorter", rate: 70 });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.emp_id.trim() || !form.name.trim()) { setError("Employee ID and name are required."); return; }
    setSaving(true);
    try {
      await apiRequest("/api/workers", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          emp_id: form.emp_id.trim(),
          name: form.name.trim(),
          rate: Number(form.rate),
          hours: 0,
          present: false,
        }),
      });
      navigate({ to: "/contractor/daily" });
    } catch (err) {
      setError(err.message || "Unable to save worker.");
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Add New Worker" subtitle="Register a new daily wage worker.">
      <div className="max-w-lg">
        <Section title="Worker Details">
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Employee ID">
              <input
                required className={inputCls} placeholder="EMP001"
                value={form.emp_id} onChange={set("emp_id")}
              />
            </Field>
            <Field label="Name">
              <input
                required className={inputCls} placeholder="Full Name"
                value={form.name} onChange={set("name")}
              />
            </Field>
            <Field label="Role">
              <select className={inputCls} value={form.role} onChange={set("role")}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Default Rate / hr (₹)">
              <input
                required type="number" min="0" className={inputCls}
                value={form.rate} onChange={set("rate")}
              />
            </Field>
            <div className="pt-3 flex flex-wrap gap-3">
              <Btn type="button" variant="ghost" onClick={() => navigate({ to: "/contractor/daily" })}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Worker"}
              </Btn>
            </div>
          </form>
        </Section>
      </div>
    </DashboardLayout>
  );
}
