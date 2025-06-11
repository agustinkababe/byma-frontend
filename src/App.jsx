import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (e) => {
    e.preventDefault(); // previene el reload del form
    setIsLoading(true);
    try {
      const response = await fetch("https://byma-scraper.onrender.com/generate-csv", {
        headers: {
          "Authorization": "Basic " + btoa(`${username}:${password}`)
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bonos_byma.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el CSV:", error);
      alert("No se pudo descargar el archivo. Verifica usuario y contraseña.");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Descargar CSV de BYMA</h1>
      <form onSubmit={handleDownload}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Usuario:{" "}
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
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
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>
        <button type="submit" disabled={isLoading || !username || !password}>
          {isLoading ? "Descargando..." : "Descargar CSV"}
        </button>
      </form>
    </div>
  );
}

export default App;
