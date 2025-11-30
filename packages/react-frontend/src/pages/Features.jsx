import React from "react";
import "./Features.css";

import featuresImg from "../assets/features-illustration.svg";

export default function Features() {
  return (
    <div className="features-page">
      <section className="features-hero">
        <h1 className="features-title">Explore our vision</h1>
      </section>

      <section className="image-hero">
        <img
          src={featuresImg}
          alt="Warehouse and features illustration"
          className="features-image"
        />
      </section>

      <section className="features-text-grid">
        <h2 className="grid-heading">Manage your inventory.</h2>
        <div className="feature-item">
          <h3>Items</h3>
          <p>
            Item entries allows you to add your items and track custom details.
          </p>
        </div>

        <div className="feature-item">
          <h3>Inventory Overview</h3>
          <p>
            Inventory overview shows your entire inventory in one easy view.
          </p>
        </div>

        <div className="feature-item">
          <h3>Item Photos</h3>
          <p>
            Item photos helps you track the appearance and condition of your
            items.
          </p>
        </div>

        <h2 className="grid-heading">Customize your inventory.</h2>

        <div className="feature-item">
          <h3>Custom Fields</h3>
          <p>
            Custom fields allow you to track and customize unique information
            about your items.
          </p>
        </div>

        <div className="feature-item">
          <h3>Identification Generation</h3>
          <p>
            Generate and print custom identification to instantly add and manage
            your items.
          </p>
        </div>

        <div className="feature-item">
          <h3>Purchase Orders</h3>
          <p>
            Create and export orders using inventory details like item names,
            photos, costs, quantities, and more.
          </p>
        </div>

        <div className="feature-item">
          <h3>Item Check-in/Check-out</h3>
          <p>
            Check-in/Check-out lets your team manage items so you always know
            who had what, which inventory is on the floor, and back stock
            available.
          </p>
        </div>
      </section>
    </div>
  );
}
