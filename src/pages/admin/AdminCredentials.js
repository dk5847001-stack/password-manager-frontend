import React, { useEffect, useState } from "react";

const API = `${process.env.REACT_APP_API_URL}/api/admin/credentials`;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminCredentials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const fetchCreds = async () => {
    try {
      setLoading(true);
      setStatus("");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Admin token not found. Please login again.");
      }

      const res = await fetch(API, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server did not return JSON");
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed");
      }

      setList(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setStatus("Error: " + (e.message || "Fetch failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreds();
  }, []);

  return (
    <div className="as-wrap">
      <div className="as-header">
        <div>
          <h2 className="as-title">Admin • Credentials</h2>
          <p className="as-sub">
            Passwords never shown ✅ • Total: <b>{list.length}</b>
          </p>
        </div>

        <div className="as-actions">
          <button className="as-btn ghost" onClick={fetchCreds} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {status && <div className="as-status" style={{ marginTop: 12 }}>{status}</div>}

      <div className="as-card" style={{ marginTop: 14 }}>
        <div className="as-tableHead">
          <div>Date</div>
          <div>Platform</div>
          <div>Email</div>
          <div className="as-right">Owner</div>
        </div>

        {list.length === 0 ? (
          <div className="as-empty">{loading ? "Loading..." : "No credentials found"}</div>
        ) : (
          list.map((c) => (
            <div className="as-row" key={c._id}>
              <div className="as-mono">{formatDate(c.createdAt)}</div>
              <div>{c.platform || "-"}</div>
              <div className="as-email">{c.email || "-"}</div>
              <div className="as-right">
                {c.user?.name || c.user?.email || "-"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}