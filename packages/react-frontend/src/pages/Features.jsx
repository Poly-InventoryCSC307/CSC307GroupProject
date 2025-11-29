import React from "react"; 
import "./Features.css";

import listsSymbol from "../assets/lists-symbol.svg";
import labelSymbol from "../assets/label-symbol.svg";
import itemsSymbol from "../assets/items-symbol.svg";
import photosSymbol from "../assets/photos-symbol.svg"; 
import shoppingSymbol from "../assets/shopping-symbol.svg";

export default function Features () {
  return (
    <div className="features-page">
      <h1 className="features-title">Explore our vision</h1>

      {/* FIRST SECTION */}
      <div className="features-section">
        <h2 className="features-heading">Organize your inventory.</h2>

        <div className="features-grid">
          <div className="feature-item">
            <img src={itemsSymbol} className="feature-icon" alt="Items" />
            <h3>Items</h3>
            <p>Item entries allow you to add your items and track custom details.</p>
          </div>

          <div className="feature-item">
            <img src={photosSymbol} className="feature-icon" alt="Item Photos" />
            <h3>Item Photos</h3>
            <p>Item Photos help track the appearance and condition of items.</p>
          </div>

          <div className="feature-item">
            <img src={listsSymbol} className="feature-icon" alt="Inventory Lists" />
            <h3>Inventory Lists</h3>
            <p>Inventory Lists show your entire inventory in one easy view.</p>
          </div>
        </div>
      </div>

      {/* SECOND SECTION */}
      <div className="features-section">
        <h2 className="features-heading">Manage your inventory.</h2>

        <div className="features-grid">
          <div className="feature-item">
            <img src={labelSymbol} className="feature-icon" alt="Label Generation" />
            <h3>Label Generation</h3>
            <p>Label Generation lets you generate and print custom identification keys with ease.</p>
          </div>

          <div className="feature-item">
            <img src={shoppingSymbol} className="feature-icon" alt="Purchase Inventory" />
            <h3>Purchase Inventory</h3>
            <p>Purchase Inventory allows for easy restocking and tracking.</p>
          </div>
        </div>
      </div>

    </div>
  );
}