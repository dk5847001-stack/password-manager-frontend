import React, { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";
import AdminPaywall from "./AdminPaywall";

export default function AdminGatePay() {
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState("");

  const checkAccess = async () => {
    try {
      setLoading(true);
      setErr("");

      const token = localStorage.getItem("token"); // ✅ tumhara token key name
      if (!token) throw new Error("No token");
      const res = await fetch("https://password-manager-backend.onrender.com/api/admin/access", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Access check failed");

      setUnlocked(!!data.data.adminPaid);
    } catch (e) {
      setErr(e.message || "Failed");
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Checking access...</div>;
  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;

  if (!unlocked) {
    return <AdminPaywall onUnlocked={checkAccess} />;
  }

  return <AdminPanel />;
}