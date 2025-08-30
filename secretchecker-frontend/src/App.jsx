import { useState } from "react";

function App() {
  const [prefix, setPrefix] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const configuredApiBase = (import.meta.env.VITE_API_BASE || "").trim();
  const API_BASE = configuredApiBase.replace(/\/+$/, "");
  const year = new Date().getFullYear();

  async function checkSecret(e) {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/check_secret.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_prefix: prefix }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult(payload);
      } else {
        setResult(payload);
      }
    } catch (err) {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  const statusColor = result?.error ? "text-red-600" : "text-emerald-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="px-6 py-16 mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Secret Checker</h1>
          <p className="mt-3 text-slate-300">Enter a 4-character prefix to verify against the secure secret.</p>
        </header>

        <div className="p-6 rounded-2xl border shadow-xl backdrop-blur bg-white/5 border-white/10 sm:p-8">
          <form onSubmit={checkSecret} className="space-y-6">
            <div>
              <label htmlFor="prefix" className="block mb-2 text-sm font-medium text-slate-300">
                Secret prefix
              </label>
              <div className="flex gap-3 items-center">
                <input
                  id="prefix"
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.slice(0, 4))}
                  placeholder="e.g. aBcd"
                  maxLength={4}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="px-4 py-3 w-full font-mono tracking-widest rounded-xl border bg-white/10 border-white/10 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading || prefix.length !== 4}
                  className="inline-flex justify-center items-center px-5 py-3 font-medium text-white bg-emerald-500 rounded-xl shadow transition-colors hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex gap-2 items-center">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Checking...
                    </span>
                  ) : (
                    "Check"
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Prefix must be exactly 4 characters.</p>
            </div>
          </form>

          {result && (
            <div className="p-4 mt-8 rounded-xl border border-white/10 bg-black/20">
              <div className={`text-sm font-medium ${statusColor}`}>
                {result.error ? "Incorrect" : "Match"}
              </div>
              <pre className="overflow-x-auto p-4 mt-3 text-xs rounded-lg bg-black/30 text-slate-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <footer className="mt-10 text-sm text-center text-slate-400">
          © {year} ciancode.com
        </footer>
      </div>
    </div>
  );
}

export default App;
