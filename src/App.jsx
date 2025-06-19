import React, { useState, useEffect } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("https://byma-scraper.onrender.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      setToken(data.access_token);
      sessionStorage.setItem("token", data.access_token);
    } catch (error) {
      console.error("Error al autenticar:", error);
      alert("Usuario o contraseña inválidos");
    }
  };

  const handleLogout = () => {
    setToken(null);
    sessionStorage.removeItem("token");
    setUsername("");
    setPassword("");
    setFile(null);
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!file || !token) return;

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

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else {
          throw new Error(`Error: ${response.status}`);
        }
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
      alert("Hubo un error al procesar tu archivo.");
    }

    setIsLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Descargar CSV de BYMA</h1>

      {!token ? (
        <>
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
          <button onClick={handleLogin} disabled={!username || !password}>
            Iniciar sesión
          </button>
        </>
      ) : (
        <>
          <form onSubmit={handleDownload}>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                Seleccionar archivo CSV:{" "}
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => setFile(e.target.files[0])}
                />
              </label>
            </div>
            <button type="submit" disabled={isLoading || !file}>
              {isLoading ? "Procesando..." : "Generar CSV"}
            </button>
          </form>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
