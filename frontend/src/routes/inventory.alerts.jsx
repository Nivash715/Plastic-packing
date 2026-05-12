// inventory.alerts.jsx — Low Stock Alerts (converted from TSX to JSX)
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Section, Btn } from "@/components/PageHelpers";
import { AlertTriangle, ShoppingCart, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/inventory/alerts")({
  head: () => ({ meta: [{ title: "Low Stock Alerts — BrushPack" }] }),
  component: Page,
});

const defaultAlerts = [
  { name: "Cardboard Boxes — Small",  qty: 1100, unit: "pcs",   min: 1500, supplier: "PackKraft Industries", eta: "2 days" },
  { name: "Blister Cards — 18mm",     qty: 920,  unit: "pcs",   min: 1500, supplier: "ClearPlast Co.",       eta: "3 days" },
  { name: "Sealing Tape — 48mm",      qty: 14,   unit: "rolls", min: 30,   supplier: "AdhesivePro",          eta: "1 day"  },
];

function Page() {
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(false);

  const loadAlerts = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/stock/low")
      .then((r) => r.json())
      .then((data) => {
        setAlerts(data.map((item) => ({
          name: item.name, qty: item.qty, unit: item.unit, min: item.min,
          supplier: "TBD", eta: "Pending",
        })));
      })
      .catch(() => {
        const stored = localStorage.getItem("lowStockNotifications");
        if (stored) {
          try {
            const items = JSON.parse(stored);
            setAlerts(items.map((item) => ({ ...item, supplier: "TBD", eta: "Pending" })));
          } catch { setAlerts(defaultAlerts); }
        } else {
          setAlerts(defaultAlerts);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAlerts(); }, []);

  return (
    <DashboardLayout
      title="Low Stock Alerts"
      subtitle="Packaging materials below minimum threshold — reorder soon."
      lowStockItems={alerts}
    >
      {/* Banner */}
      <div className="rounded-2xl bg-warm/15 border border-accent/30 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 hover-lift">
        <div className="h-10 w-10 rounded-full bg-accent grid place-items-center text-accent-foreground shrink-0 animate-float">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground">{alerts.length} items need attention</div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reorder these to avoid packing line halts.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={loadAlerts} className="text-muted-foreground hover:text-foreground transition" title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link to="/inventory/stock" className="text-sm text-primary hover:underline whitespace-nowrap">
            View all stock →
          </Link>
        </div>
      </div>

      <Section title="Items below minimum">
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">All stock levels are healthy.</div>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.map((a, i) => {
              const deficit = a.min - a.qty;
              const pct     = Math.round((a.qty / a.min) * 100);
              return (
                <li
                  key={a.name}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="animate-fade-in py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Supplier: {a.supplier} · ETA {a.eta}</div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-1.5 w-full max-w-[200px] rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-destructive transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-sm whitespace-nowrap">
                    <span className="text-destructive font-medium">{a.qty.toLocaleString()} {a.unit}</span>
                    <span className="text-muted-foreground"> / {a.min.toLocaleString()} min</span>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">Short by {deficit.toLocaleString()} {a.unit}</div>

                  {/* Action */}
                  <Btn variant="accent">
                    <ShoppingCart className="h-4 w-4" /> Reorder
                  </Btn>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </DashboardLayout>
  );
}
