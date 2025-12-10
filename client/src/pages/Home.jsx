import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home page">
      {/* Hero section */}
      <section className="home-hero" aria-labelledby="home-heading">
        <div>
          <h1 id="home-heading" className="home-title">
            Waypoint – your US travel companion
          </h1>
          <p className="home-subtitle">
            Track your trips across the United States, see which states
            you&apos;ve visited, and plan what&apos;s left to explore. Waypoint
            keeps your journeys organized in one place.
          </p>

          <div className="home-cta">
            <Link to="/register" className="btn primary btn-lg">
              Create an account
            </Link>
            <Link to="/login" className="btn btn-lg">
              Log in
            </Link>
          </div>
        </div>

        <div className="home-tip">
          <span className="tip-badge">TIP</span>
          <p>
            After you sign in, open <strong>My Trips</strong> to add detailed
            trips and see your visited states on the map.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section aria-label="Waypoint features">
        <div className="home-features">
          <article className="feature-card">
            <h3>Log detailed trips</h3>
            <p>
              Add trips with multiple destinations, dates, and expenses so you
              can remember exactly where you went and when.
            </p>
          </article>

          <article className="feature-card">
            <h3>See visited states</h3>
            <p>
              View your visited states on an interactive US map and quickly see
              which parts of the country you&apos;ve explored.
            </p>
          </article>

          <article className="feature-card">
            <h3>Track travel stats</h3>
            <p>
              Keep an eye on how many trips you&apos;ve taken, how many days
              you&apos;ve traveled, and your overall spending.
            </p>
          </article>

          <article className="feature-card">
            <h3>Private to your account</h3>
            <p>
              Your trips and visited states are tied to your personal account,
              so you can log back in and pick up where you left off.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
