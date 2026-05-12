// DashboardLayout.jsx — main shell with new teal + dark-slate colour scheme
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, PackageCheck, Activity, LineChart,
  Users, UserCog, FileText, ReceiptText, Boxes,
  AlertTriangle, LogOut, Menu, X, Search, Bell,
  ChevronDown, Package, AlertCircle,
} from "lucide-react";

const groups = [
  { title: "Overview", items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Packing Production",
    items: [
      { to: "/production/weight",        label: "Output Tracking", icon: PackageCheck },
      { to: "/production/status",        label: "Order Status",    icon: Activity     },
      { to: "/production/weekly-report", label: "Weekly Report",   icon: LineChart    },
    ],
  },
  {
    title: "Workforce",
    items: [
      { to: "/contractor/salary", label: "Contractor Salary", icon: UserCog },
      { to: "/contractor/daily",  label: "Daily Workers",     icon: Users   },
    ],
  },
  {
    title: "Billing & Accounts",
    items: [
      { to: "/billing/create",    label: "Create Billing", icon: ReceiptText },
      { to: "/billing/quotation", label: "Quotation",      icon: FileText    },
    ],
  },
  {
    title: "Materials & Inventory",
    items: [
      { to: "/inventory/stock",  label: "Stock",            icon: Boxes         },
      { to: "/inventory/alerts", label: "Low Stock Alerts", icon: AlertTriangle },
    ],
  },
];

/* ── colour tokens (must match CSS variables set in styles.css) ── */
const C = {
  sidebar:        "#1a202c",   // dark slate
  sidebarBorder:  "#2d3748",
  sidebarText:    "#e2e8f0",
  sidebarMuted:   "#718096",
  activeItem:     "#0d7377",   // teal primary
  activeText:     "#ffffff",
  hoverItem:      "#2d3748",
  appBg:          "#f0f4f8",   // light slate-blue
  headerBg:       "rgba(240,244,248,0.90)",
  accent:         "#d97706",   // amber
};

export function DashboardLayout({ children, title, subtitle, lowStockItems = [] }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen]                   = useState(false);
  const [notificationOpen, setNotiOpen]   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [openGroups, setOpenGroups]       = useState(() => {
    const init = {};
    groups.forEach((g) => { init[g.title] = g.items.some((i) => i.to === location.pathname); });
    init["Overview"] = true;
    return init;
  });

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("lowStockNotifications");
    if (stored) {
      try { setNotifications(JSON.parse(stored)); } catch { setNotifications([]); }
    }
  }, []);

  useEffect(() => {
    if (lowStockItems?.length > 0) {
      const n = lowStockItems.map((item) => ({
        id: item.name, name: item.name, qty: item.qty,
        min: item.min, unit: item.unit,
        timestamp: new Date().toLocaleTimeString(),
      }));
      setNotifications(n);
      localStorage.setItem("lowStockNotifications", JSON.stringify(n));
    }
  }, [lowStockItems]);

  const toggleGroup = (title) => setOpenGroups((s) => ({ ...s, [title]: !s[title] }));

  const clearNotif = (id) => {
    const u = notifications.filter((n) => n.id !== id);
    setNotifications(u);
    localStorage.setItem("lowStockNotifications", JSON.stringify(u));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("lowStockNotifications");
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.appBg }}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 xl:w-72 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: C.sidebar, borderRight: `1px solid ${C.sidebarBorder}` }}
      >
        {/* Logo row */}
        <div
          className="px-4 sm:px-5 py-5 flex items-center gap-3 shrink-0"
          style={{ borderBottom: `1px solid ${C.sidebarBorder}` }}
        >
          <div
            className="h-9 w-9 rounded-xl grid place-items-center animate-float shrink-0"
            style={{ backgroundColor: C.activeItem }}
          >
            <Package className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-base leading-none font-semibold truncate" style={{ color: C.sidebarText }}>
              BrushPack
            </div>
            <div className="text-xs mt-0.5" style={{ color: C.sidebarMuted }}>Packaging Operations</div>
          </div>
          <button
            className="lg:hidden p-1 rounded"
            style={{ color: C.sidebarMuted }}
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {groups.map((g) => {
            const isOverview = g.title === "Overview" && g.items.length === 1;
            const expanded   = openGroups[g.title];

            if (isOverview) {
              const item   = g.items[0];
              const Icon   = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? C.activeItem : "transparent",
                    color: active ? C.activeText : C.sidebarText,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = C.hoverItem; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <div key={g.title}>
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(g.title)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: C.sidebarMuted }}
                >
                  <span className="flex-1 text-left truncate">{g.title}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
                  />
                </button>

                {expanded && (
                  <div className="ml-1 mt-0.5 space-y-0.5">
                    {g.items.map((item, idx) => {
                      const Icon   = item.icon;
                      const active = location.pathname === item.to;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          style={{
                            animationDelay: `${idx * 40}ms`,
                            backgroundColor: active ? C.activeItem : "transparent",
                            color: active ? C.activeText : C.sidebarText,
                          }}
                          className="animate-slide-in-left flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                          onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = C.hoverItem; }}
                          onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
            style={{ color: C.sidebarMuted }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.hoverItem; e.currentTarget.style.color = C.sidebarText; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.sidebarMuted; }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ══════════════ MAIN AREA ══════════════ */}
      <main className="flex-1 min-w-0 flex flex-col">

        {/* ── Top Header ── */}
        <header
          className="sticky top-0 z-20 shrink-0"
          style={{
            backgroundColor: C.headerBg,
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #cbd5e0",
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3">
            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-md transition-colors"
              style={{ color: "#4a5568" }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1
                className="font-display text-lg sm:text-xl lg:text-2xl truncate font-semibold"
                style={{ color: "#1a202c" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm mt-0.5 truncate hidden sm:block" style={{ color: "#718096" }}>
                  {subtitle}
                </p>
              )}
            </div>

            {/* Search */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg w-48 lg:w-60 xl:w-72"
              style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e0" }}
            >
              <Search className="h-4 w-4 shrink-0" style={{ color: "#a0aec0" }} />
              <input
                placeholder="Search…"
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: "#1a202c", caretColor: "#0d7377" }}
              />
            </div>

            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setNotiOpen((s) => !s)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: "#718096" }}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span
                    className="absolute top-1 right-1 h-4 w-4 rounded-full text-white text-[10px] grid place-items-center font-semibold"
                    style={{ backgroundColor: C.accent }}
                  >
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotiOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl z-50 animate-fade-in overflow-hidden"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
                    }}
                  >
                    <div
                      className="p-4 flex items-center justify-between"
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      <div className="font-semibold text-sm flex items-center gap-2" style={{ color: "#1a202c" }}>
                        <AlertCircle className="h-4 w-4" style={{ color: C.accent }} />
                        Low Stock Alerts
                      </div>
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs" style={{ color: "#718096" }}>
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm" style={{ color: "#718096" }}>No alerts</div>
                      ) : notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 transition-colors"
                          style={{ borderBottom: "1px solid #f7fafc" }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate" style={{ color: "#1a202c" }}>{n.name}</div>
                              <div className="text-xs mt-0.5" style={{ color: "#e53e3e" }}>
                                {n.qty?.toLocaleString()} {n.unit} / {n.min?.toLocaleString()} min
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: "#a0aec0" }}>{n.timestamp}</div>
                            </div>
                            <button
                              onClick={() => clearNotif(n.id)}
                              className="text-lg leading-none mt-0.5"
                              style={{ color: "#a0aec0" }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3" style={{ borderTop: "1px solid #e2e8f0", backgroundColor: "#f7fafc" }}>
                        <Link
                          to="/inventory/alerts"
                          onClick={() => setNotiOpen(false)}
                          className="text-sm font-medium"
                          style={{ color: C.activeItem }}
                        >
                          View all alerts →
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Avatar */}
            <div
              className="h-8 w-8 rounded-full grid place-items-center font-semibold text-sm shrink-0 text-white"
              style={{ backgroundColor: C.activeItem }}
            >
              M
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <div
          key={location.pathname}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-fade-in"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
