import React, { useState } from "react";
import API_BASE from "../../apiBase";

export default function AdminPaywall({ onUnlocked }) {
  const [status, setStatus] = useState("");
  const [paymentId, setPaymentId] = useState(localStorage.getItem("lastPaymentId") || "");

  const startPayment = async () => {
    try {
      setStatus("Creating order...");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await fetch(`${API_BASE}/api/pay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Order failed");

      const order = data.order;

      setStatus("Opening checkout...");

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_xxxxx",
        amount: order.amount,
        currency: order.currency,
        name: "UltraVault",
        description: "Admin Access Unlock",
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log("Razorpay response =>", response);
            setStatus("Verifying payment...");

            const vr = await fetch(`${API_BASE}/api/pay/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const vd = await vr.json();
            if (!vr.ok || !vd.success) throw new Error(vd.message || "Verify failed");

            const savedPaymentId = vd.paymentId || response.razorpay_payment_id;
            setPaymentId(savedPaymentId);
            localStorage.setItem("lastPaymentId", savedPaymentId);

            setStatus("Unlocked ✅");
            onUnlocked?.();
          } catch (e) {
            setStatus("Error: " + e.message);
          }
        },
        theme: { color: "#0d6efd" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  };

  const downloadReceipt = async () => {
    try {
      setStatus("Downloading receipt...");

      const token = localStorage.getItem("token");
      const pid = paymentId || localStorage.getItem("lastPaymentId");

      if (!token) throw new Error("No token");
      if (!pid) throw new Error("Payment receipt not found");

      const res = await fetch(`${API_BASE}/api/pay/receipt/${pid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Receipt download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${pid}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      setStatus("Receipt downloaded ✅");
    } catch (e) {
      setStatus("Error: " + e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Unlock Admin Access</h2>
      <p>Pay once to access Admin Panel (UPI supported).</p>

      <button onClick={startPayment} style={{ padding: "10px 14px" }}>
        Pay & Unlock
      </button>

      {paymentId && (
        <button
          onClick={downloadReceipt}
          style={{ padding: "10px 14px", marginLeft: 10 }}
        >
          Download Receipt PDF
        </button>
      )}

      {status && <div style={{ marginTop: 12 }}>{status}</div>}
    </div>
  );
}