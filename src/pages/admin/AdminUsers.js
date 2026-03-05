import React, { useEffect, useState } from "react";

const API = "https://password-manager-backend.onrender.com/api/admin/users";

export default function AdminUsers() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const fetchUsers = async () => {
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
            const users = data.users || data.data || data.data?.users || [];
            setList(Array.isArray(users) ? users : []);
        } catch (e) {
            setStatus("Error: " + (e.message || "Fetch failed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="as-wrap">
            <div className="as-header">
                <div>
                    <h2 className="as-title">Admin • Users</h2>
                    <p className="as-sub">Total: <b>{list.length}</b></p>
                </div>
                <div className="as-actions">
                    <button className="as-btn ghost" onClick={fetchUsers} disabled={loading}>
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {status && <div className="as-status" style={{ marginTop: 12 }}>{status}</div>}

            <div className="as-card" style={{ marginTop: 14 }}>
                <div className="as-tableHead">
                    <div>Name</div>
                    <div>Email</div>
                    <div className="as-right">Role</div>
                </div>

                {list.length === 0 ? (
                    <div className="as-empty">{loading ? "Loading..." : "No users found"}</div>
                ) : (
                    list.map((u) => (
                        <div className="as-row" key={u._id}>
                            <div>{u.name || "-"}</div>
                            <div className="as-email">{u.email}</div>
                            <div className="as-right">{u.role || "user"}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}