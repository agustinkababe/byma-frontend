import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("https://byma-scraper.onrender.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      setToken(data.access_token);
      alert("Autenticado correctamente");
    } catch (error) {
      console.error("Error de login:", error);
      alert("Credenciales inválidas");
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Seleccioná un archivo CSV");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://byma-scraper.onrender.com/upload-csv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Falló la descarga del CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bonos_output.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar CSV:", error);
      alert("No se pudo generar el archivo.");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>BYMA Scraper</h1>

      {!token ? (
        <form onSubmit={handleLogin}>
          <div>
            <label>
              Usuario:
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </label>
          </div>
          <div>
            <label>
              Contraseña:
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit">Iniciar sesión</button>
        </form>
      ) : (
        <form onSubmit={handleDownload}>
          <div>
            <label>
              Seleccioná archivo CSV:
              <input
                type="file"
                accept=".csv"
                onChange={e => setFile(e.target.files[0])}
                required
              />
            </label>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Generando..." : "Generar CSV"}
          </button>
        </form>
      )}
    </div>
  );
}

export default App;
