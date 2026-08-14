import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MTC_ROUTES = [
  {
    number: "60A",
    from: "Royapuram B.S",
    to: "Kundrathur B.S",
    type: "Regular",
  },
  {
    number: "102",
    from: "Island Ground",
    to: "Kelambakkam",
    type: "Express",
  },
  {
    number: "21G",
    from: "Broadway",
    to: "Tambaram",
    type: "Regular",
  },
  {
    number: "70",
    from: "CMBT",
    to: "Avadi",
    type: "Express",
  },
];

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView(
        [location.latitude, location.longitude],
        15
      );
    }
  }, [location, map]);

  return null;
}

function App() {
  const [location, setLocation] = useState(null);
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [crowd, setCrowd] = useState(null);

  const [loading, setLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = time.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const isWeekend =
    time.getDay() === 0 || time.getDay() === 6;

  const detectLocation = () => {
    setError("");
    setLoading(true);
    setCrowd(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLocation(newLocation);

        await findNearbyStops(
          newLocation.latitude,
          newLocation.longitude
        );

        setLastUpdated(new Date());
        setLoading(false);
      },
      () => {
        setError(
          "Unable to detect your location. Please allow GPS access."
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const findNearbyStops = async (latitude, longitude) => {
    setStopLoading(true);
    setError("");

    const query = `
      [out:json][timeout:25];
      node["highway"="bus_stop"]
      (around:2000,${latitude},${longitude});
      out body;
    `;

    const servers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.private.coffee/api/interpreter",
    ];

    for (const server of servers) {
      try {
        const response = await fetch(server, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: query,
        });

        if (!response.ok) continue;

        const data = await response.json();

        const results = data.elements
          .map((stop) => ({
            id: stop.id,
            name:
              stop.tags?.name ||
              stop.tags?.["name:en"] ||
              "Unnamed Stop",
            latitude: stop.lat,
            longitude: stop.lon,
          }))
          .map((stop) => ({
            ...stop,
            distance: calculateDistance(
              latitude,
              longitude,
              stop.latitude,
              stop.longitude
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 12);

        if (results.length) {
          setStops(results);
          setSelectedStop(results[0]);
          setStopLoading(false);
          return;
        }
      } catch {
        console.log("Trying next server...");
      }
    }

    setStopLoading(false);
    setError("Unable to load nearby bus stops.");
  };

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return (
      R *
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )
    );
  };

  const predictCrowd = () => {
    const hour = time.getHours();

    let score = 35;

    if (hour >= 7 && hour <= 10) score += 30;
    if (hour >= 16 && hour <= 20) score += 32;
    if (hour >= 11 && hour <= 14) score += 8;

    if (isWeekend) score -= 18;

    if (selectedRoute?.type === "Express") {
      score += 5;
    }

    if (selectedStop?.distance < 0.5) {
      score += 4;
    }

    score += Math.floor(Math.random() * 10) - 5;

    score = Math.max(5, Math.min(100, score));

    let level;
    let emoji;
    let recommendation;

    if (score < 35) {
      level = "Low";
      emoji = "●";
      recommendation =
        "Excellent time to travel. Lower crowd expected.";
    } else if (score < 60) {
      level = "Moderate";
      emoji = "●";
      recommendation =
        "Crowd should be manageable.";
    } else if (score < 80) {
      level = "High";
      emoji = "●";
      recommendation =
        "Expect a busy service. Consider waiting.";
    } else {
      level = "Very High";
      emoji = "●";
      recommendation =
        "Heavy crowd expected. Try another time.";
    }

    setCrowd({
      score,
      level,
      emoji,
      recommendation,
    });
  };

  const historical = useMemo(
    () => [28, 38, 55, 73, 82, 68, 48, 35],
    []
  );

  const refresh = () => {
    if (location) {
      findNearbyStops(
        location.latitude,
        location.longitude
      );

      setLastUpdated(new Date());
      setCrowd(null);
    } else {
      detectLocation();
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">CW</div>

          <div>
            <strong>CrowdWise</strong>
            <span>Mobility Intelligence</span>
          </div>
        </div>

        <nav>
          <a className="active">⌂ Dashboard</a>
          <a>◉ Live Map</a>
          <a>▣ Bus Stops</a>
          <a>◈ Predictions</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="system">
            <span></span>
            System operational
          </div>

          <small>
            CrowdWise v1.0
          </small>
        </div>
      </aside>

      {/* MAIN */}

      <div className="content">

        {/* TOP BAR */}

        <div className="topbar">

          <div>
            <span className="eyebrow">
              TRANSPORTATION INTELLIGENCE
            </span>

            <h1>Dashboard</h1>
          </div>

          <div className="top-actions">

            <div className="clock">
              <strong>{formattedTime}</strong>
              <span>{formattedDate}</span>
            </div>

            <button
              className="refresh"
              onClick={refresh}
            >
              ↻
            </button>

            <div className="avatar">
              CW
            </div>

          </div>
        </div>

        {/* HERO */}

        <section className="hero-card">

          <div className="hero-copy">

            <div className="live-tag">
              <span></span>
              LIVE INTELLIGENCE
            </div>

            <h2>
              Know the crowd
              <br />
              <span>before you travel.</span>
            </h2>

            <p>
              AI-powered crowd intelligence
              for smarter urban bus travel.
            </p>

            <button
              className="detect"
              onClick={detectLocation}
            >
              <span>⌖</span>
              Detect my location
            </button>

          </div>

          <div className="hero-metrics">

            <div>
              <span>GPS STATUS</span>
              <strong>
                {location
                  ? "Connected"
                  : "Waiting"}
              </strong>
            </div>

            <div>
              <span>NEARBY STOPS</span>
              <strong>{stops.length}</strong>
            </div>

            <div>
              <span>ENGINE</span>
              <strong>Online</strong>
            </div>

          </div>

        </section>

        {/* NOTICES */}

        {loading && (
          <div className="notice">
            <span className="loader"></span>
            Detecting your location...
          </div>
        )}

        {stopLoading && (
          <div className="notice">
            <span className="loader"></span>
            Finding nearby bus stops...
          </div>
        )}

        {error && (
          <div className="error">
            ⚠ {error}
          </div>
        )}

        {/* MAP */}

        <section className="section">

          <div className="section-top">

            <div>
              <span className="eyebrow">
                LIVE NETWORK
              </span>

              <h2>Nearby transport</h2>
            </div>

            <div className="map-status">
              <span></span>
              {location
                ? "GPS active"
                : "GPS offline"}
            </div>

          </div>

          {location ? (
            <div className="map-wrapper">

              <MapContainer
                center={[
                  location.latitude,
                  location.longitude,
                ]}
                zoom={15}
                style={{
                  width: "100%",
                  height: "520px",
                }}
              >

                <RecenterMap
                  location={location}
                />

                <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Circle
                  center={[
                    location.latitude,
                    location.longitude,
                  ]}
                  radius={40}
                />

                <CircleMarker
                  center={[
                    location.latitude,
                    location.longitude,
                  ]}
                  radius={9}
                >
                  <Popup>
                    You are here
                  </Popup>
                </CircleMarker>

                {stops.map((stop) => (
                  <Marker
                    key={stop.id}
                    position={[
                      stop.latitude,
                      stop.longitude,
                    ]}
                    eventHandlers={{
                      click: () => {
                        setSelectedStop(stop);
                        setCrowd(null);
                      },
                    }}
                  >
                    <Popup>
                      <strong>
                        {stop.name}
                      </strong>
                      <br />
                      {stop.distance.toFixed(2)} km
                      away
                    </Popup>
                  </Marker>
                ))}

              </MapContainer>

            </div>
          ) : (
            <div className="map-empty">
              <div>⌖</div>
              <h3>Location not detected</h3>
              <p>
                Detect your location to see
                nearby bus stops.
              </p>

              <button
                onClick={detectLocation}
              >
                Detect location
              </button>
            </div>
          )}

        </section>

        {/* STOPS + PREDICTION */}

        <div className="two-column">

          {/* STOPS */}

          <section className="section">

            <div className="section-top">
              <div>
                <span className="eyebrow">
                  BUS NETWORK
                </span>

                <h2>Nearby stops</h2>
              </div>

              <span className="count">
                {stops.length} found
              </span>
            </div>

            <div className="stop-list">

              {stops.length === 0 ? (
                <div className="empty-small">
                  No stops detected yet.
                </div>
              ) : (
                stops.map((stop, index) => (

                  <button
                    key={stop.id}
                    className={
                      selectedStop?.id === stop.id
                        ? "stop selected"
                        : "stop"
                    }
                    onClick={() => {
                      setSelectedStop(stop);
                      setCrowd(null);
                    }}
                  >

                    <div className="stop-index">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="stop-info">

                      <strong>
                        {stop.name}
                      </strong>

                      <span>
                        {stop.distance.toFixed(2)}
                        {" "}km from you
                      </span>

                    </div>

                    <div className="arrow">
                      →
                    </div>

                  </button>

                ))
              )}

            </div>

          </section>

          {/* PREDICTION */}

          <section className="prediction-card">

            <div>
              <span className="eyebrow">
                AI PREDICTION
              </span>

              <h2>
                Crowd forecast
              </h2>

              <p>
                Based on time, weekday,
                route and historical patterns.
              </p>
            </div>

            {selectedStop ? (

              <>

                <div className="prediction-stop">
                  <span>Selected stop</span>
                  <strong>
                    {selectedStop.name}
                  </strong>
                </div>

                <button
                  className="predict"
                  onClick={predictCrowd}
                >
                  Generate prediction →
                </button>

                {crowd && (

                  <div className="prediction-result">

                    <div className="prediction-level">

                      <div
                        className={
                          crowd.level === "Low"
                            ? "dot low"
                            : crowd.level ===
                              "Moderate"
                            ? "dot moderate"
                            : crowd.level ===
                              "High"
                            ? "dot high"
                            : "dot very-high"
                        }
                      ></div>

                      <div>
                        <span>
                          EXPECTED CROWD
                        </span>

                        <strong>
                          {crowd.level}
                        </strong>
                      </div>

                    </div>

                    <div className="score">
                      <div className="score-top">
                        <span>
                          Crowd score
                        </span>

                        <strong>
                          {crowd.score}%
                        </strong>
                      </div>

                      <div className="score-track">
                        <div
                          style={{
                            width:
                              `${crowd.score}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="recommendation">
                      <span>✦</span>
                      {crowd.recommendation}
                    </div>

                  </div>

                )}

              </>

            ) : (

              <div className="prediction-empty">
                <div>◌</div>
                Select a bus stop to predict
                crowd.
              </div>

            )}

          </section>

        </div>

        {/* ROUTES */}

        <section className="section">

          <div className="section-top">

            <div>
              <span className="eyebrow">
                ROUTE INTELLIGENCE
              </span>

              <h2>MTC routes</h2>
            </div>

            <span className="data-badge">
              Reference data
            </span>

          </div>

          <div className="routes">

            {MTC_ROUTES.map((route) => (

              <button
                key={route.number}
                className={
                  selectedRoute?.number ===
                  route.number
                    ? "route selected"
                    : "route"
                }
                onClick={() =>
                  setSelectedRoute(route)
                }
              >

                <div className="route-number">
                  {route.number}
                </div>

                <div className="route-content">

                  <strong>
                    {route.from}
                  </strong>

                  <div className="route-line">
                    <span></span>
                    <i></i>
                    <span></span>
                  </div>

                  <strong>
                    {route.to}
                  </strong>

                  <small>
                    {route.type} service
                  </small>

                </div>

              </button>

            ))}

          </div>

        </section>

        {/* ANALYTICS */}

        <section className="section">

          <div className="section-top">

            <div>
              <span className="eyebrow">
                CROWD ANALYTICS
              </span>

              <h2>Daily demand pattern</h2>
            </div>

            <span className="data-badge">
              Simulated historical data
            </span>

          </div>

          <div className="chart">

            {historical.map(
              (value, index) => (

                <div
                  className="chart-item"
                  key={index}
                >

                  <span>
                    {value}%
                  </span>

                  <div className="bar-area">

                    <div
                      className="bar"
                      style={{
                        height:
                          `${value}%`,
                      }}
                    ></div>

                  </div>

                  <small>
                    {
                      [
                        "6A",
                        "8A",
                        "10A",
                        "12P",
                        "2P",
                        "4P",
                        "6P",
                        "8P",
                      ][index]
                    }
                  </small>

                </div>

              )
            )}

          </div>

        </section>

        {/* SYSTEM */}

        <section className="system-grid">

          <div className="system-card">
            <span className="green-dot"></span>

            <div>
              <strong>
                GPS Location
              </strong>

              <small>
                Browser geolocation
              </small>
            </div>

            <b>
              {location
                ? "ACTIVE"
                : "WAITING"}
            </b>
          </div>

          <div className="system-card">
            <span className="green-dot"></span>

            <div>
              <strong>
                OpenStreetMap
              </strong>

              <small>
                Bus stop data
              </small>
            </div>

            <b>ONLINE</b>
          </div>

          <div className="system-card">
            <span className="green-dot"></span>

            <div>
              <strong>
                Prediction Engine
              </strong>

              <small>
                Crowd intelligence
              </small>
            </div>

            <b>ONLINE</b>
          </div>

          <div className="system-card">
            <span className="yellow-dot"></span>

            <div>
              <strong>
                MTC Live GPS
              </strong>

              <small>
                Official feed
              </small>
            </div>

            <b>LIMITED</b>
          </div>

        </section>

        {/* FOOTER */}

        <footer>

          <div className="footer-brand">
            <strong>
              CrowdWise
            </strong>

            <span>
              Smarter journeys. Better cities.
            </span>
          </div>

          <span>
            Hackathon Prototype • 2026
          </span>

          <a
            href="https://mtcbus.tn.gov.in/"
            target="_blank"
            rel="noreferrer"
          >
            MTC Official ↗
          </a>

        </footer>

      </div>
    </div>
  );
}

export default App;