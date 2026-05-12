// login.jsx — Sign-in page
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Package } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BrushPack" },
      { name: "description", content: "Manager login for BrushPack packaging operations." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate  = useNavigate();
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [username, setUsername] = useState("manager");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    setLoading(true);
    setTimeout(() => navigate({ to: "/" }), 600);
  };

  return (
    /*
     * OUTER WRAPPER — single solid deep-navy background, no gradients, no blobs.
     * Uses the CSS variable --login-bg (#0f2027) set in styles.css.
     */
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "#0f2027" }}
    >
      {/* ── Card ── */}
      <div className="w-full max-w-sm sm:max-w-md animate-scale-in">
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: "0 24px 64px -16px rgba(0,0,0,0.45)",
          }}
        >
          {/* Brand mark */}
          <div className="flex flex-col items-center text-center mb-7">
            <div
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl grid place-items-center animate-float"
              style={{ backgroundColor: "#0d7377" }}
            >
              <Package className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={2.2} />
            </div>
            <h1
              className="mt-4 font-display text-2xl sm:text-3xl tracking-tight"
              style={{ color: "#1a202c" }}
            >
              BrushPack
            </h1>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4 sm:space-y-5">
            {/* Error banner */}
            {error && (
              <div
                className="rounded-lg px-4 py-2.5 text-sm font-medium"
                style={{
                  backgroundColor: "#FFF5F5",
                  color: "#C53030",
                  border: "1px solid #FED7D7",
                }}
              >
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#2d3748" }}
              >
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Enter username"
                className="w-full rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none transition"
                style={{
                  border: "1.5px solid #cbd5e0",
                  backgroundColor: "#f7fafc",
                  color: "#1a202c",
                  caretColor: "#0d7377",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#0d7377")}
                onBlur={(e)  => (e.target.style.borderColor = "#cbd5e0")}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#2d3748" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-2.5 sm:py-3 pr-11 text-sm outline-none transition"
                  style={{
                    border: "1.5px solid #cbd5e0",
                    backgroundColor: "#f7fafc",
                    color: "#1a202c",
                    caretColor: "#0d7377",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0d7377")}
                  onBlur={(e)  => (e.target.style.borderColor = "#cbd5e0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition"
                  style={{ color: "#a0aec0" }}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 sm:py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: loading ? "#a0aec0" : "#0d7377",
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 16px rgba(13,115,119,0.4)",
              }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Footer note */}
          <p
            className="text-xs text-center mt-6"
            style={{ color: "#a0aec0" }}
          >
            BrushPack Packaging Operations · Manager Portal
          </p>
        </div>
      </div>
    </div>
  );
}
