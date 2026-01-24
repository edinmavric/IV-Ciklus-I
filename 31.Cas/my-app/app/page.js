"use client";

import { useState } from "react";

export default function HomePage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
  });
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "user",
  });

  const callApi = async (url, options = {}) => {
    setLoading(true);
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
      textAlign: "center",
      marginBottom: "40px",
      paddingBottom: "20px",
      borderBottom: "2px solid #e5e7eb",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#111827",
      margin: "0 0 8px 0",
    },
    subtitle: {
      color: "#6b7280",
      fontSize: "1rem",
      margin: 0,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      marginBottom: "24px",
    },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    cardTitle: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    methodBadge: (method) => ({
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "0.75rem",
      fontWeight: "600",
      color: "#fff",
      backgroundColor:
        method === "GET"
          ? "#10b981"
          : method === "POST"
          ? "#3b82f6"
          : method === "PATCH"
          ? "#f59e0b"
          : method === "DELETE"
          ? "#ef4444"
          : "#6b7280",
    }),
    endpoint: {
      color: "#6b7280",
      fontSize: "0.875rem",
      fontFamily: "monospace",
    },
    buttonGroup: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s",
      backgroundColor: "#f3f4f6",
      color: "#374151",
    },
    buttonPrimary: {
      backgroundColor: "#3b82f6",
      color: "#fff",
    },
    buttonDanger: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
    },
    input: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "0.875rem",
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "8px",
    },
    select: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      fontSize: "0.875rem",
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "8px",
      backgroundColor: "#fff",
    },
    inputRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "8px",
      marginBottom: "12px",
    },
    responseCard: {
      backgroundColor: "#1f2937",
      borderRadius: "12px",
      padding: "24px",
      color: "#fff",
    },
    responseHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    responseTitle: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#9ca3af",
      margin: 0,
    },
    statusBadge: (status) => ({
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor:
        status >= 200 && status < 300
          ? "#065f46"
          : status >= 400
          ? "#991b1b"
          : "#1e40af",
      color: "#fff",
    }),
    pre: {
      margin: 0,
      padding: "16px",
      backgroundColor: "#111827",
      borderRadius: "8px",
      overflow: "auto",
      maxHeight: "300px",
      fontSize: "0.8rem",
      lineHeight: "1.5",
    },
    fullWidth: {
      gridColumn: "1 / -1",
    },
    loadingText: {
      color: "#9ca3af",
      fontStyle: "italic",
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>API Routes Demo</h1>
        <p style={styles.subtitle}>31. Čas - Next.js Backend Integracija</p>
      </header>

      <div style={styles.grid}>
        {/* GET All Posts */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("GET")}>GET</span>
            <span style={styles.endpoint}>/api/posts</span>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={styles.button}
              onClick={() => callApi("/api/posts")}
              disabled={loading}
            >
              Svi postovi
            </button>
            <button
              style={styles.button}
              onClick={() => callApi("/api/posts?author=Edin")}
              disabled={loading}
            >
              Filter: Edin
            </button>
          </div>
        </div>

        {/* GET Single Post */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("GET")}>GET</span>
            <span style={styles.endpoint}>/api/posts/:id</span>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={styles.button}
              onClick={() => callApi("/api/posts/1")}
              disabled={loading}
            >
              Post #1
            </button>
            <button
              style={styles.button}
              onClick={() => callApi("/api/posts/2")}
              disabled={loading}
            >
              Post #2
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonDanger }}
              onClick={() => callApi("/api/posts/999")}
              disabled={loading}
            >
              Post #999 (404)
            </button>
          </div>
        </div>

        {/* POST Create */}
        <div style={{ ...styles.card, ...styles.fullWidth }}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("POST")}>POST</span>
            <span style={styles.endpoint}>/api/posts</span>
          </div>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Naslov"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <input
              style={styles.input}
              placeholder="Sadržaj"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <input
              style={styles.input}
              placeholder="Autor"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={() =>
              callApi("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
              })
            }
            disabled={loading}
          >
            Kreiraj post
          </button>
        </div>

        {/* PATCH Update */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("PATCH")}>PATCH</span>
            <span style={styles.endpoint}>/api/posts/:id</span>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={styles.button}
              onClick={() =>
                callApi("/api/posts/1", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title: "Ažurirani naslov!" }),
                })
              }
              disabled={loading}
            >
              Ažuriraj post #1
            </button>
            <button
              style={styles.button}
              onClick={() =>
                callApi("/api/posts/2", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: "Novi sadržaj..." }),
                })
              }
              disabled={loading}
            >
              Ažuriraj post #2
            </button>
          </div>
        </div>

        {/* DELETE */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("DELETE")}>DELETE</span>
            <span style={styles.endpoint}>/api/posts/:id</span>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.button, ...styles.buttonDanger }}
              onClick={() => callApi("/api/posts/1", { method: "DELETE" })}
              disabled={loading}
            >
              Obriši post #1
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonDanger }}
              onClick={() => callApi("/api/posts", { method: "DELETE" })}
              disabled={loading}
            >
              Obriši SVE
            </button>
          </div>
        </div>

        {/* GET Users */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("GET")}>GET</span>
            <span style={styles.endpoint}>/api/users</span>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={styles.button}
              onClick={() => callApi("/api/users")}
              disabled={loading}
            >
              Svi useri
            </button>
            <button
              style={styles.button}
              onClick={() => callApi("/api/users?role=admin")}
              disabled={loading}
            >
              Samo admini
            </button>
            <button
              style={styles.button}
              onClick={() => callApi("/api/users?role=user")}
              disabled={loading}
            >
              Samo useri
            </button>
          </div>
        </div>

        {/* POST User */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span style={styles.methodBadge("POST")}>POST</span>
            <span style={styles.endpoint}>/api/users</span>
          </div>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Ime"
              value={userFormData.name}
              onChange={(e) =>
                setUserFormData({ ...userFormData, name: e.target.value })
              }
            />
            <input
              style={styles.input}
              placeholder="Email"
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
            />
            <select
              style={styles.select}
              value={userFormData.role}
              onChange={(e) =>
                setUserFormData({ ...userFormData, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={() =>
              callApi("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userFormData),
              })
            }
            disabled={loading}
          >
            Kreiraj usera
          </button>
        </div>

        {/* Response */}
        <div style={{ ...styles.responseCard, ...styles.fullWidth }}>
          <div style={styles.responseHeader}>
            <h3 style={styles.responseTitle}>RESPONSE</h3>
            {response?.status && (
              <span style={styles.statusBadge(response.status)}>
                {response.status}
              </span>
            )}
          </div>
          {loading ? (
            <p style={styles.loadingText}>Učitavanje...</p>
          ) : response ? (
            <pre style={styles.pre}>
              {JSON.stringify(response.data || response, null, 2)}
            </pre>
          ) : (
            <p style={styles.loadingText}>
              Kliknite na dugme da testirate API
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
