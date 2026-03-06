import React, { useState } from "react";
import "./Footer.css";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("Please enter valid email");
      return;
    }

    if (!message) {
      setStatus("Please write message");
      return;
    }

    try {
      setStatus("Saving...");

      const res = await fetch(`${API_URL}/api/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          message,
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server did not return JSON");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save data");
      }

      if (data.success) {
        setStatus("Subscribed successfully ✅");
        setEmail("");
        setMessage("");
      } else {
        setStatus(data.message || "Error saving data");
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      setStatus("Error saving data");
    }
  };

  return (
    <footer className="uv-footer">
      <div className="uv-footer__container">
        <div className="uv-footer__card">
          <div className="uv-footer__col">
            <div className="uv-footer__brand">
              <div className="uv-footer__logo">🔐</div>
              <div>
                <div className="uv-footer__title">
                  Ultra Vault <span className="uv-footer__badge">v2.5</span>
                </div>
                <div className="uv-footer__tagline">
                  Secure • Encrypted • Cloud Sync
                </div>
              </div>
            </div>

            <p className="uv-footer__desc">
              A premium password vault experience built for speed, privacy and
              real-world usage. Your credentials stay protected with encryption.
            </p>

            <div className="uv-footer__socials">
              <a className="uv-footer__iconBtn" href="https://github.com/" target="_blank" rel="noreferrer">
                <FaGithub />
              </a>

              <a className="uv-footer__iconBtn" href="https://linkedin.com/" target="_blank" rel="noreferrer">
                <FaLinkedin />
              </a>

              <a className="uv-footer__iconBtn" href="https://facebook.com/" target="_blank" rel="noreferrer">
                <FaFacebook />
              </a>

              <a className="uv-footer__iconBtn" href="https://instagram.com/" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>

              <a className="uv-footer__iconBtn" href="https://wa.me/9905167559" target="_blank" rel="noreferrer">
                <FaWhatsapp />
              </a>

              <a className="uv-footer__link" href="/admin">Admin</a>
            </div>
          </div>

          <div className="uv-footer__col">
            <h5 className="uv-footer__heading">Subscribe</h5>

            <p className="uv-footer__muted">
              Get updates about Ultra Vault features, security upgrades & new
              releases.
            </p>

            <form className="uv-footer__form" onSubmit={handleSubscribe}>
              <div className="uv-footer__inputWrap">
                <FaEnvelope className="uv-footer__inputIcon" />
                <input
                  className="uv-footer__input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <textarea
                className="uv-footer__textarea"
                placeholder="Write your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>

              <button className="uv-footer__btn" type="submit">
                Subscribe <FaArrowRight />
              </button>
            </form>

            {status && <div className="uv-footer__status">{status}</div>}
          </div>

          <div className="uv-footer__col">
            <h5 className="uv-footer__heading">Get in touch</h5>

            <div className="uv-footer__contact">
              <div className="uv-footer__chip">
                <span className="uv-footer__chipLabel">Email</span>
                <a className="uv-footer__chipValue" href="mailto:dk5847001@gmail.com">
                  dk5847001@gmail.com
                </a>
              </div>

              <div className="uv-footer__chip">
                <span className="uv-footer__chipLabel">Support</span>
                <span className="uv-footer__chipValue">24/7 (Premium UI)</span>
              </div>

              <div className="uv-footer__links">
                <a className="uv-footer__link" href="/dashboard">Dashboard</a>
                <a className="uv-footer__link" href="/">Login</a>
                <a className="uv-footer__link" href="/reset-password">Reset</a>
              </div>
            </div>
          </div>
        </div>

        <div className="uv-footer__bottom">
          <span>© {new Date().getFullYear()} Ultra Vault</span>
          <span className="uv-footer__dot">•</span>
          <span>
            Built by <strong>Dilkhush Kumar</strong>
          </span>
          <span className="uv-footer__dot">•</span>
          <span className="uv-footer__mini">All data encrypted</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;