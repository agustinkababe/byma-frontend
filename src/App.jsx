import React, { useState } from "react";

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://tickerssky-backend.onrender.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username,
          password
        })
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();
      setToken(data.access_token);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApiCall = async (endpoint) => {
    if (!file || !token) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`https://tickerssky-backend.onrender.com/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Error al generar CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${endpoint}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "500px", margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>Tickers Sky</h1>

      {!token ? (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Usuario:{" "}
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ padding: "0.5rem", width: "100%", boxSizing: "border-box" }}
                autoFocus
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Contraseña:{" "}
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: "0.5rem", width: "100%", boxSizing: "border-box" }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={!username || !password}
            style={{ width: "100%", padding: "0.75rem", backgroundColor: "#1976d2", color: "white", border: "none" }}
          >
            Iniciar sesión
          </button>
        </form>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Seleccionar archivo CSV:{" "}
              <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>
          <button
            onClick={() => handleApiCall("upload-csv")}
            disabled={!file || isLoading}
            style={{ width: "100%", padding: "0.75rem", marginBottom: "0.5rem" }}
          >
            {isLoading ? "Generando..." : "Generar Byma CSV"}
          </button>
          <button
            onClick={() => handleApiCall("upload-alpha-csv")}
            disabled={!file || isLoading}
            style={{ width: "100%", padding: "0.75rem" }}
          >
            {isLoading ? "Generando..." : "Generar Alpha CSV"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
