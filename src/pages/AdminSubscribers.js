import React, { useEffect, useMemo, useState } from "react";
import "./AdminSubscribers.css";

const API = "http://localhost:5000/api/subscribers";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminSubscribers() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      setStatus("");
      const token = localStorage.getItem("token");

const res = await fetch(API, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");
      setList(data.data || []);
    } catch (e) {
      setStatus("Error: " + (e.message || "Fetch failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((x) => {
      const email = (x.email || "").toLowerCase();
      const msg = (x.message || "").toLowerCase();
      return email.includes(s) || msg.includes(s);
    });
  }, [q, list]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this subscriber?");
    if (!ok) return;

    try {
      setStatus("Deleting...");
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Delete failed");

      setList((prev) => prev.filter((x) => x._id !== id));
      setStatus("Deleted ✅");
      setTimeout(() => setStatus(""), 1500);
    } catch (e) {
      setStatus("Error: " + (e.message || "Delete failed"));
    }
  };

  const exportCSV = () => {
    window.open(`${API}/export/csv`, "_blank");
  };

  return (
    <div className="as-wrap">
      <div className="as-header">
        <div>
          <h2 className="as-title">Admin • Subscribers</h2>
          <p className="as-sub">
            Total: <b>{list.length}</b> • Showing: <b>{filtered.length}</b>
          </p>
        </div>

        <div className="as-actions">
          <button className="as-btn ghost" onClick={fetchList} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="as-btn" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="as-toolbar">
        <input
          className="as-search"
          placeholder="Search by email or message..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {status && <div className="as-status">{status}</div>}
      </div>

      <div className="as-card">
        <div className="as-tableHead">
          <div>Date</div>
          <div>Email</div>
          <div>Message</div>
          <div className="as-right">Action</div>
        </div>

        {filtered.length === 0 ? (
          <div className="as-empty">{loading ? "Loading..." : "No subscribers found"}</div>
        ) : (
          filtered.map((x) => (
            <div className="as-row" key={x._id}>
              <div className="as-mono">{formatDate(x.createdAt)}</div>
              <div className="as-email">{x.email}</div>
              <div className="as-msg">{x.message}</div>
              <div className="as-right">
                <button className="as-danger" onClick={() => handleDelete(x._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}