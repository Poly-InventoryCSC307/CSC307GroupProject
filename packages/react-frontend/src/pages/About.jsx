import React from "react";
import "./About.css";
import aboutImg from "../assets/about-illustration.svg"; 

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1 className="about-title">Expand your horizons</h1>
        <img src={aboutImg} alt="Warehouse and dashboard illustration" className="about-image" />
      </section>

      <section className="about-text-section">
        <p className="about-paragraph">
          Poly+ Inventory is a student-led project dedicated to making inventory
          management easier and more affordable for everyone. In an era where AI
          drives the creation of countless websites that prioritize quantity over
          quality, our team takes a different approach. We focus on real user needs,
          offering a service that helps businesses track and restock items across
          multiple locations with clarity and efficiency.
        </p>

        <p className="about-paragraph">
          Our technology is built to fit smoothly into any business environment,
          making tracking and restocking simple from anywhere. Our system works
          across all devices and browsers, so teams can check inventory at a glance
          whether they’re on-site or on the go. Real-time updates, automated alerts,
          and flexible tools help keep operations running efficiently.
        </p>
      </section>
    </div>
  );
}