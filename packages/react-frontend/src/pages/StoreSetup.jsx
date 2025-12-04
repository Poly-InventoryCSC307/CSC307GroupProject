// StoreSetup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext/index";

import { API_BASE_URL } from "../apiConfig";

import "./StoreSetup.css";
import "../components/PopUp.css";

export default function StoreSetup({ onStoreCreated }) {
  const { currentUser } = useAuth(); // Get the logged in user ID
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to create a store.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          name: form.name,
          location: {
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create store");
      }

      const store = await res.json(); // expect { _id, name, location, ... }
      onStoreCreated?.(store);
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="signup-background">
      {/* reuse popup "modal" styling for the card */}
      <div className="signup-container modal">
        <header className="modal-header">
          <h3 className="signup-header">Set up your store</h3>
        </header>

        <form
          className="store-setup-form modal-content"
          onSubmit={handleSubmit}
        >
          <div className="signup-info">
            Tell us about your location so we can store your inventory.
          </div>

          <div className="field">
            <label htmlFor="name">Store name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="street">Street</label>
            <input
              id="street"
              name="street"
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="state">State</label>
            <input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="zip">ZIP</label>
            <input
              id="zip"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <footer className="modal-actions">
            <button className="btn primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create store"}
            </button>
          </footer>
        </form>
      </div>
    </section>
  );
}
