import { useState } from "react";

function App() {
  const [prefix, setPrefix] = useState("");
  const [result, setResult] = useState(null);

  async function checkSecret(e) {
    e.preventDefault();
    setResult(null);

    try {
      const res = await fetch("/check_secret.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret_prefix: prefix }),
      });

      if (!res.ok) {
        const err = await res.json();
        setResult(err);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Network error" });
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Secret Checker</h1>
      <form onSubmit={checkSecret}>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="Enter 4-character prefix"
          maxLength={4}
        />
        <button type="submit">Check</button>
      </form>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default App;
