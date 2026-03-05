import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import AdminSubscribers from "./pages/AdminSubscribers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./Navbar";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminGatePay from "./pages/admin/AdminGatePay";

import AdminGate from "./pages/AdminGate";
import RequireAdmin from "./components/RequireAdmin";

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const publicRoutes = ["/", "/register", "/forgot-password"];
  const isResetRoute = location.pathname.startsWith("/reset-password");

  // 🌙 Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  // ✅ Load user (with fallback) + refresh on route change
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const ultraUser = localStorage.getItem("ultraUser");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const finalName =
          parsedUser?.name ||
          parsedUser?.username ||
          (parsedUser?.email ? parsedUser.email.split("@")[0] : "") ||
          ultraUser ||
          "User";

        setUsername(finalName);
      } catch (e) {
        setUsername(ultraUser || "User");
      }
    } else {
      setUsername(ultraUser || "User");
    }
  }, [location.pathname]);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ultraUser");
    localStorage.removeItem("ultraVault"); // optional (remove if you want to keep vault)
    setUsername("");
    navigate("/", { replace: true });
  };

  // ✅ Navbar show condition (TOKEN based)
  const token = localStorage.getItem("token");
  const showNavbar = !!token && !publicRoutes.includes(location.pathname) && !isResetRoute;

  return (
    <>
      {showNavbar && (
        <Navbar
          username={username}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}

    <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password/:token" element={<ResetPassword />} />
  {/* Admin Paywall Gate */}
  <Route path="/admin" element={<AdminGatePay />} />

  {/* ✅ Protected Subscribers */}
 <Route
  path="/admin"
  element={
    <RequireAdmin>
      <AdminPanel />
    </RequireAdmin>
  }
/>
</Routes>
    </>
  );
}

export default AppWrapper;