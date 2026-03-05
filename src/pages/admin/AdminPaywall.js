import React, { useState } from "react";

export default function AdminPaywall({ onUnlocked }) {
    const [status, setStatus] = useState("");

    const startPayment = async () => {
        try {
            setStatus("Creating order...");

            // ✅ TEMP: testing user id header (replace with JWT later)
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token");

            const res = await fetch("https://password-manager-backend.onrender.com/api/pay/create-order", {
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
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_xxxxx", // better: env
                amount: order.amount,
                currency: order.currency,
                name: "UltraVault",
                description: "Admin Access Unlock",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        setStatus("Verifying payment...");

                        const vr = await fetch("https://password-manager-backend.onrender.com/api/pay/verify", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(response),
                        });

                        const vd = await vr.json();
                        if (!vr.ok || !vd.success) throw new Error(vd.message || "Verify failed");

                        setStatus("Unlocked ✅");
                        onUnlocked?.(); // switch to AdminPanel
                    } catch (e) {
                        setStatus("Error: " + e.message);
                    }
                },
                theme: { color: "#0d6efd" },
            };

            // eslint-disable-next-line no-undef
            const rzp = new window.Razorpay(options);
            rzp.open();
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
            {status && <div style={{ marginTop: 12 }}>{status}</div>}
        </div>
    );
}