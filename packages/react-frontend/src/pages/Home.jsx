import React from "react";
import "./Home.css";
import inventoryCard from "../assets/inventory-card.svg";
import performanceCard from "../assets/performance-card.svg";
import capacityCard from "../assets/capacity-card.svg";

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-line white">Free inventory software.</h1>
        <h1 className="hero-line mint">Powered by Cal Poly innovation.</h1>
      </div>

      <div className="card-stack">
        <img src={inventoryCard} alt="Inventory" className="stack-card card1" />
        <img src={capacityCard} alt="Capacity" className="stack-card card2" />
        <img src={performanceCard} alt="Performance" className="stack-card card3" />
      </div>
    </section>
  );
}