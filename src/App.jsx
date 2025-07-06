import React, { useState } from "react";

function App() {
  const BASE_URL = "https://byma-scraper.onrender.com";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Submit con Enter
    try {
      const response = await fetch(`${BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        }),
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

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleDownload = async (endpoint) => {
    if (!csvFile || !token) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Error generando CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = endpoint === "upload-csv" ? "bonos_byma.csv" : "datos_alpha.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al generar el archivo");
    }

    setIsLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Tickers Sky</h1>

      {!token ? (
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button
            disabled={!csvFile || isLoading}
            onClick={() => handleDownload("upload-csv")}
          >
            {isLoading ? "Generando..." : "Generar Byma CSV"}
          </button>
          <button
            disabled={!csvFile || isLoading}
            onClick={() => handleDownload("alpha-csv")}
          >
            {isLoading ? "Generando..." : "Generar Alpha CSV"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
