// client/src/components/UsVisitedMap.jsx
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import * as d3geo from "d3-geo";
import { feature as topoToGeo } from "topojson-client";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const VISITED_FILL = "#7ccba2";
const NOT_VISITED_FILL = "#e8eef2";
const HOVER_STROKE = "#333";

const FIPS_TO_CODE = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  10: "DE",
  11: "DC",
  12: "FL",
  13: "GA",
  15: "HI",
  16: "ID",
  17: "IL",
  18: "IN",
  19: "IA",
  20: "KS",
  21: "KY",
  22: "LA",
  23: "ME",
  24: "MD",
  25: "MA",
  26: "MI",
  27: "MN",
  28: "MS",
  29: "MO",
  30: "MT",
  31: "NE",
  32: "NV",
  33: "NH",
  34: "NJ",
  35: "NM",
  36: "NY",
  37: "NC",
  38: "ND",
  39: "OH",
  40: "OK",
  41: "OR",
  42: "PA",
  44: "RI",
  45: "SC",
  46: "SD",
  47: "TN",
  48: "TX",
  49: "UT",
  50: "VT",
  51: "VA",
  53: "WA",
  54: "WV",
  55: "WI",
  56: "WY",
};

export default function UsVisitedMap({ visited, onToggle }) {
  const [geos, setGeos] = useState(null);
  const vset = useMemo(() => new Set(visited), [visited]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const res = await fetch(GEO_URL);
      const topo = await res.json();
      const states = topoToGeo(topo, topo.objects.states);
      if (!cancel) setGeos(states);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const width = 800;
  const height = 500;

  const projection = useMemo(
    () =>
      d3geo
        .geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(1000),
    [width, height]
  );

  const path = useMemo(() => d3geo.geoPath(projection), [projection]);

  if (!geos) return <div className="card">Loading map…</div>;

  return (
    <div className="card" style={{ padding: 16 }}>
      <svg width={width} height={height} className="us-map-svg">
        <g>
          {geos.features.map((feat) => {
            const fips = String(feat.id).padStart(2, "0");
            const code = FIPS_TO_CODE[fips] || "??";
            const isVisited = vset.has(code);

            return (
              <path
                key={feat.id}
                d={path(feat)}
                className="state-shape"
                onClick={() => code !== "??" && onToggle && onToggle(code)}
                tabIndex={code === "??" ? -1 : 0}
                role="button"
                aria-pressed={isVisited}
                aria-label={code === "??" ? "Unknown region" : `${code} state`}
                onKeyDown={(e) => {
                  if (code === "??") return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle && onToggle(code);
                  }
                }}
                style={{
                  fill: isVisited ? VISITED_FILL : NOT_VISITED_FILL,
                  stroke: "#999",
                  strokeWidth: 0.5,
                  cursor: code === "??" ? "default" : "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.stroke = HOVER_STROKE;
                  e.currentTarget.style.strokeWidth = 0.75;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.stroke = "#999";
                  e.currentTarget.style.strokeWidth = 0.5;
                }}
              />
            );
          })}
        </g>
      </svg>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        Click or press Enter/Space on a state to toggle visited.
      </p>
    </div>
  );
}

UsVisitedMap.propTypes = {
  visited: PropTypes.arrayOf(PropTypes.string),
  onToggle: PropTypes.func,
};

UsVisitedMap.defaultProps = {
  visited: [],
  onToggle: undefined,
};
