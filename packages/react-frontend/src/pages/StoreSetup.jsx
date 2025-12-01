import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext/index"; 

export default function StoreSetup({ onStoreCreated }) {
  const { currentUser } = useAuth();        // Get the loggged in user ID
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
      const res = await fetch("http://localhost:8000/stores", {
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
    <div className="store-setup-page">
      <h1>Set up your store</h1>
      <p>Tell us about your location so we can store your inventory.</p>

      <form className="store-setup-form" onSubmit={handleSubmit}>
        <label>
          Store name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Street
          <input
            name="street"
            value={form.street}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          City
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </label>

        <div className="store-setup-row">
          <label>
            State
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            ZIP
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Create store"}
        </button>
      </form>
    </div>
  );
}
