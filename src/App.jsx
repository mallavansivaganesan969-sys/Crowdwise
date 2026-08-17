import { useEffect, useMemo, useState } from "react";

const ROUTES = [
  {
    id: "21G",
    name: "Tambaram → Broadway",
    short: "Tambaram to Broadway",
    occupancy: 42,
    buses: 12,
    frequency: "8 min",
    status: "low",
    passengers: 31,
    capacity: 74,
    trend: -6,
    color: "low",
  },
  {
    id: "18A",
    name: "Chennai Central → Tambaram",
    short: "Central to Tambaram",
    occupancy: 68,
    buses: 9,
    frequency: "6 min",
    status: "moderate",
    passengers: 50,
    capacity: 74,
    trend: 8,
    color: "moderate",
  },
  {
    id: "70",
    name: "Guindy → Avadi",
    short: "Guindy to Avadi",
    occupancy: 81,
    buses: 7,
    frequency: "10 min",
    status: "high",
    passengers: 60,
    capacity: 74,
    trend: 13,
    color: "high",
  },
  {
    id: "5E",
    name: "Velachery → Broadway",
    short: "Velachery to Broadway",
    occupancy: 57,
    buses: 11,
    frequency: "7 min",
    status: "moderate",
    passengers: 42,
    capacity: 74,
    trend: 4,
    color: "moderate",
  },
  {
    id: "M1",
    name: "Kelambakkam → T. Nagar",
    short: "Kelambakkam to T. Nagar",
    occupancy: 91,
    buses: 6,
    frequency: "12 min",
    status: "critical",
    passengers: 67,
    capacity: 74,
    trend: 18,
    color: "critical",
  },
  {
    id: "23C",
    name: "Adyar → CMBT",
    short: "Adyar to CMBT",
    occupancy: 49,
    buses: 10,
    frequency: "9 min",
    status: "low",
    passengers: 36,
    capacity: 74,
    trend: -2,
    color: "low",
  },
];

const STOPS = [
  {
    id: 1,
    name: "Tambaram",
    area: "Tambaram West",
    routes: ["21G", "18A"],
    crowd: 63,
  },
  {
    id: 2,
    name: "Chromepet",
    area: "GST Road",
    routes: ["21G", "18A"],
    crowd: 54,
  },
  {
    id: 3,
    name: "Pallavaram",
    area: "GST Road",
    routes: ["21G", "18A"],
    crowd: 71,
  },
  {
    id: 4,
    name: "Guindy",
    area: "Inner Ring Road",
    routes: ["70", "5E"],
    crowd: 82,
  },
  {
    id: 5,
    name: "Saidapet",
    area: "Anna Salai",
    routes: ["18A", "5E"],
    crowd: 67,
  },
  {
    id: 6,
    name: "T. Nagar",
    area: "Central Chennai",
    routes: ["M1", "5E"],
    crowd: 89,
  },
  {
    id: 7,
    name: "Adyar",
    area: "Adyar Main Road",
    routes: ["23C", "5E"],
    crowd: 46,
  },
  {
    id: 8,
    name: "CMBT",
    area: "Koyambedu",
    routes: ["23C", "70"],
    crowd: 76,
  },
];

const DEMAND_DATA = [
  { time: "06:00", value: 28 },
  { time: "07:00", value: 43 },
  { time: "08:00", value: 71 },
  { time: "09:00", value: 88 },
  { time: "10:00", value: 64 },
  { time: "11:00", value: 49 },
  { time: "12:00", value: 56 },
  { time: "13:00", value: 61 },
  { time: "14:00", value: 52 },
  { time: "15:00", value: 58 },
  { time: "16:00", value: 69 },
  { time: "17:00", value: 82 },
  { time: "18:00", value: 94 },
  { time: "19:00", value: 87 },
  { time: "20:00", value: 73 },
];

const ALERTS = [
  {
    type: "critical",
    icon: "!",
    title: "Critical crowd detected",
    route: "M1",
    time: "2 min ago",
    description:
      "Passenger density is approaching maximum capacity on the Kelambakkam corridor.",
  },
  {
    type: "warning",
    icon: "△",
    title: "Demand spike predicted",
    route: "70",
    time: "8 min ago",
    description:
      "AI model predicts an increase in demand during the next 20 minutes.",
  },
  {
    type: "normal",
    icon: "✓",
    title: "Network operating normally",
    route: "21G",
    time: "14 min ago",
    description:
      "Passenger flow has returned to normal levels after the morning peak.",
  },
];

const NAV_ITEMS = [
  { id: "overview", icon: "⌂", label: "Overview" },
  { id: "network", icon: "⌁", label: "Network" },
  { id: "routes", icon: "▣", label: "Routes" },
  { id: "prediction", icon: "◈", label: "AI Prediction" },
  { id: "analytics", icon: "▥", label: "Analytics" },
  { id: "alerts", icon: "!", label: "Alerts", count: 3 },
];

function getStatusLabel(status) {
  return {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",
  }[status];
}

function getStatusClass(status) {
  return `status-${status}`;
}

function getPredictionStatus(value) {
  if (value < 45) return "low";
  if (value < 70) return "moderate";
  if (value < 85) return "high";
  return "critical";
}

function App() {
  const [activePage, setActivePage] = useState("overview");
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[1]);
  const [selectedStop, setSelectedStop] = useState(STOPS[0]);
  const [predictionMinutes, setPredictionMinutes] = useState(20);
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const averageOccupancy = useMemo(() => {
    const total = ROUTES.reduce((sum, route) => sum + route.occupancy, 0);
    return Math.round(total / ROUTES.length);
  }, []);

  const criticalRoutes = ROUTES.filter(
    (route) => route.status === "critical" || route.status === "high"
  ).length;

  const predictionValue = useMemo(() => {
    if (!selectedRoute) return 0;

    const base = selectedRoute.occupancy;
    const timeEffect =
      predictionMinutes <= 15
        ? 5
        : predictionMinutes <= 30
          ? 9
          : predictionMinutes <= 45
            ? 13
            : 16;

    return Math.min(98, Math.round(base + timeEffect));
  }, [selectedRoute, predictionMinutes]);

  const predictionStatus = getPredictionStatus(predictionValue);

  const runPrediction = () => {
    setIsPredicting(true);
    setPrediction(null);

    setTimeout(() => {
      setPrediction({
        value: predictionValue,
        status: predictionStatus,
        confidence: Math.min(
          98,
          Math.round(88 + Math.random() * 8)
        ),
      });
      setIsPredicting(false);
    }, 900);
  };

  const scrollToSection = (page) => {
    setActivePage(page);

    const element = document.getElementById(`page-${page}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const selectRoute = (route) => {
    setSelectedRoute(route);
    setPrediction(null);
    setActivePage("routes");

    setTimeout(() => {
      document
        .getElementById("page-routes")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const formattedTime = lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">CW</div>

          <div>
            <strong>CrowdWise</strong>
            <span>AI BUS INTELLIGENCE</span>
          </div>
        </div>

        <div className="workspace-label">CONTROL CENTER</div>

        <nav className="main-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => scrollToSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>

              {item.count && (
                <span className="nav-count">{notifications}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-mini">
            <span>●</span>
            Passenger data anonymized
          </div>

          <div className="system-mini">
            <span />
            AI ENGINE ONLINE
          </div>

          <small>© 2026 CrowdWise Intelligence</small>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">TRANSPORT INTELLIGENCE</span>
            <h1>Network Command Center</h1>
          </div>

          <div className="top-actions">
            <div className="system-live">
              <span />
              LIVE SYSTEM
            </div>

            <div className="clock">
              <strong>{formattedTime}</strong>
              <span>Chennai · IST</span>
            </div>

            <button
              className="icon-button"
              title="Notifications"
              onClick={() => setNotifications(0)}
            >
              ♧
            </button>

            <div className="profile">CW</div>
          </div>
        </header>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section id="page-overview">
          <div className="hero">
            <div className="hero-content">
              <div className="live-label">
                <span />
                REAL-TIME CROWD INTELLIGENCE
              </div>

              <h2>
                Know the crowd
                <br />
                <em>before it arrives.</em>
              </h2>

              <p>
                CrowdWise combines live passenger signals, route
                occupancy, historical demand and AI forecasting to
                help transport operators make faster decisions.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => scrollToSection("prediction")}
                >
                  <span>◈</span>
                  Run AI Prediction
                </button>

                <button
                  className="secondary-button"
                  onClick={() => scrollToSection("network")}
                >
                  View Network →
                </button>
              </div>
            </div>

            <div className="hero-status">
              <div className="hero-status-header">
                NETWORK LOAD
                <i />
              </div>

              <div className="hero-status-number">
                {averageOccupancy}%
              </div>

              <div className="hero-status-label">
                Average passenger occupancy
              </div>

              <div className="hero-status-divider" />

              <div className="mini-metrics">
                <div>
                  <strong>56</strong>
                  <span>BUSES MONITORED</span>
                </div>

                <div>
                  <strong>94.2%</strong>
                  <span>AI CONFIDENCE</span>
                </div>

                <div>
                  <strong>18.6K</strong>
                  <span>PASSENGERS TODAY</span>
                </div>

                <div>
                  <strong>24/7</strong>
                  <span>MONITORING</span>
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-grid">
            <MetricCard
              icon="◉"
              label="BUSES TRACKED"
              value="56"
              sub="↑ 8% from yesterday"
            />

            <MetricCard
              icon="♙"
              label="PASSENGERS TODAY"
              value="18.6K"
              sub="Live network estimate"
            />

            <MetricCard
              icon="◈"
              label="AI ACCURACY"
              value="94.2%"
              sub="Prediction confidence"
            />

            <MetricCard
              icon="!"
              label="HIGH-CROWD ROUTES"
              value={criticalRoutes}
              sub="Requires attention"
              danger
            />
          </div>

          <DecisionSupport
            route={selectedRoute}
            predictionValue={predictionValue}
          />
        </section>

        {/* =================================================
            NETWORK
        ================================================= */}

        <section className="panel" id="page-network">
          <div className="panel-header">
            <div>
              <span className="eyebrow">LIVE OPERATIONS</span>
              <h2>Network Intelligence</h2>
            </div>

            <span className="data-badge">
              {ROUTES.length} ACTIVE ROUTES
            </span>
          </div>

          <div className="network-grid">
            <div className="network-map">
              <NetworkMap
                routes={ROUTES}
                selectedRoute={selectedRoute}
                onSelectRoute={selectRoute}
              />
            </div>

            <div className="network-side">
              <div className="side-heading">
                <span className="eyebrow">LIVE ROUTES</span>
                <h3>Network status</h3>
              </div>

              <div className="route-status-list">
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    className="route-status"
                    onClick={() => selectRoute(route)}
                  >
                    <div className="route-badge">{route.id}</div>

                    <div className="route-status-info">
                      <strong>{route.name}</strong>
                      <span>
                        {route.buses} buses · {route.frequency}
                      </span>
                    </div>

                    <div className="route-occupancy">
                      <b className={getStatusClass(route.status)}>
                        {route.occupancy}%
                      </b>

                      <small>
                        {getStatusLabel(route.status)}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ROUTES
        ================================================= */}

        <section id="page-routes">
          <div className="page-intro">
            <div>
              <span className="eyebrow">ROUTE INTELLIGENCE</span>
              <h2>Understand every corridor.</h2>
              <p>
                Compare occupancy, capacity, frequency and AI
                signals across the active transport network.
              </p>
            </div>

            <span className="page-badge">LIVE DATA</span>
          </div>

          <div className="route-cards">
            {ROUTES.map((route) => (
              <button
                key={route.id}
                className={`route-card ${
                  selectedRoute.id === route.id ? "selected" : ""
                }`}
                onClick={() => selectRoute(route)}
              >
                <div className="route-card-top">
                  <span className="route-large-number">
                    {route.id}
                  </span>

                  <span
                    className={`status-pill ${getStatusClass(
                      route.status
                    )}`}
                  >
                    {getStatusLabel(route.status)}
                  </span>
                </div>

                <div className="route-name">{route.name}</div>

                <div className="route-arrow">↓</div>

                <div className="route-card-footer">
                  <span>OCCUPANCY</span>
                  <strong>{route.occupancy}%</strong>
                </div>

                <div className="occupancy-track">
                  <span
                    style={{
                      width: `${route.occupancy}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="route-analysis">
            <div className="route-analysis-main">
              <span className="eyebrow">
                SELECTED CORRIDOR
              </span>

              <div className="big-percentage">
                {selectedRoute.occupancy}%
              </div>

              <div
                className={`large-status ${getStatusClass(
                  selectedRoute.status
                )}`}
              >
                {getStatusLabel(selectedRoute.status)} crowd
              </div>

              <div className="occupancy-track">
                <span
                  style={{
                    width: `${selectedRoute.occupancy}%`,
                  }}
                />
              </div>

              <p
                style={{
                  color: "#657181",
                  fontSize: "9px",
                  lineHeight: "1.7",
                  marginTop: "18px",
                }}
              >
                {selectedRoute.occupancy >= 85
                  ? "Passenger density is approaching the operational capacity threshold. Consider dispatching additional vehicles."
                  : selectedRoute.occupancy >= 70
                    ? "Crowd levels are elevated. AI monitoring recommends checking demand in the next prediction window."
                    : "Passenger flow is currently within a manageable operating range."}
              </p>
            </div>

            <div className="analysis-stats">
              <InfoStat
                label="PASSENGERS / BUS"
                value={`${selectedRoute.passengers}`}
              />

              <InfoStat
                label="BUS CAPACITY"
                value={`${selectedRoute.capacity}`}
              />

              <InfoStat
                label="ACTIVE BUSES"
                value={`${selectedRoute.buses}`}
              />

              <InfoStat
                label="FREQUENCY"
                value={selectedRoute.frequency}
              />

              <InfoStat
                label="DEMAND TREND"
                value={`${selectedRoute.trend > 0 ? "+" : ""}${selectedRoute.trend}%`}
              />

              <InfoStat
                label="AI RISK LEVEL"
                value={getStatusLabel(selectedRoute.status)}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            STOPS
        ================================================= */}

        <div className="two-panel-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">PASSENGER NODES</span>
                <h2>High-impact stops</h2>
              </div>

              <span className="data-badge">8 STOPS</span>
            </div>

            <div className="stop-list">
              {STOPS.map((stop) => (
                <button
                  key={stop.id}
                  className={`stop-item ${
                    selectedStop.id === stop.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedStop(stop)}
                >
                  <span className="stop-number">
                    0{stop.id}
                  </span>

                  <span className="stop-details">
                    <strong>{stop.name}</strong>
                    <span>
                      {stop.area} · {stop.routes.join(" / ")}
                    </span>
                  </span>

                  <span
                    className={getStatusClass(
                      getPredictionStatus(stop.crowd)
                    )}
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                    }}
                  >
                    {stop.crowd}%
                  </span>

                  <span className="stop-arrow">→</span>
                </button>
              ))}
            </div>
          </section>

          <section className="prediction-panel" id="page-prediction">
            <div>
              <span className="eyebrow">PREDICTIVE ENGINE</span>
              <h2>AI Crowd Forecast</h2>

              <p>
                Select a route and prediction horizon to estimate
                future passenger occupancy.
              </p>

              <div className="prediction-target">
                <span>SELECTED ROUTE</span>
                <strong>
                  {selectedRoute.id} · {selectedRoute.name}
                </strong>
                <small>
                  Current occupancy: {selectedRoute.occupancy}%
                </small>
              </div>

              <div className="prediction-target">
                <span>FORECAST HORIZON</span>

                <select
                  value={predictionMinutes}
                  onChange={(event) =>
                    setPredictionMinutes(
                      Number(event.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: "7px",
                    padding: "8px",
                    border: "1px solid #253027",
                    borderRadius: "6px",
                    background: "#0a100e",
                    color: "#dfe6df",
                    outline: "none",
                    fontSize: "9px",
                  }}
                >
                  <option value={10}>Next 10 minutes</option>
                  <option value={20}>Next 20 minutes</option>
                  <option value={30}>Next 30 minutes</option>
                  <option value={45}>Next 45 minutes</option>
                  <option value={60}>Next 60 minutes</option>
                </select>
              </div>

              <button
                className="primary-button full"
                onClick={runPrediction}
                disabled={isPredicting}
              >
                {isPredicting ? (
                  <>
                    <span className="loader" />
                    Analyzing network...
                  </>
                ) : (
                  <>
                    <span>◈</span>
                    Generate Prediction
                  </>
                )}
              </button>

              {prediction && (
                <div className="prediction-result">
                  <div className="prediction-result-top">
                    <span
                      className={`prediction-dot ${prediction.status}`}
                    />

                    <div>
                      <span>FORECAST OCCUPANCY</span>

                      <strong>
                        {prediction.value}% ·{" "}
                        {getStatusLabel(prediction.status)}
                      </strong>
                    </div>

                    <b>{prediction.confidence}%</b>
                  </div>

                  <div className="prediction-track">
                    <span
                      style={{
                        width: `${prediction.value}%`,
                      }}
                    />
                  </div>

                  <div className="prediction-horizon">
                    Forecast for{" "}
                    <strong>
                      {predictionMinutes} minutes
                    </strong>{" "}
                    from now
                  </div>

                  <div className="recommendation-box">
                    <span>✦</span>

                    <p>
                      {prediction.value >= 85
                        ? "AI recommends preparing additional capacity and monitoring this corridor closely."
                        : prediction.value >= 70
                          ? "AI recommends increasing monitoring frequency and preparing for elevated demand."
                          : "Current forecast remains manageable. Normal operations can continue."}
                    </p>
                  </div>
                </div>
              )}

              {!prediction && !isPredicting && (
                <div className="prediction-empty">
                  Run the AI model to generate a forecast for this
                  route.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="panel" id="page-analytics">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                HISTORICAL DEMAND MODEL
              </span>
              <h2>Network demand analytics</h2>
            </div>

            <span className="data-badge">TODAY</span>
          </div>

          <div className="demand-chart">
            {DEMAND_DATA.map((item) => (
              <div className="chart-column" key={item.time}>
                <span>{item.value}%</span>

                <div className="chart-bar-area">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${item.value}%`,
                    }}
                    title={`${item.time}: ${item.value}%`}
                  />
                </div>

                <small>{item.time}</small>
              </div>
            ))}
          </div>

          <div
            style={{
              height: "25px",
            }}
          />

          <div className="insight">
            <div className="insight-number">94%</div>

            <div>
              <strong>
                Peak-hour prediction confidence
              </strong>

              <p>
                Historical patterns show the strongest demand
                between 08:00–10:00 and 17:00–19:00. CrowdWise
                automatically increases monitoring sensitivity
                during these windows.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            ALERTS
        ================================================= */}

        <section id="page-alerts">
          <div className="page-intro">
            <div>
              <span className="eyebrow">
                OPERATIONAL SIGNALS
              </span>
              <h2>Smart alerts.</h2>

              <p>
                Important network events detected by the
                CrowdWise intelligence engine.
              </p>
            </div>
          </div>

          <div className="alert-list">
            {ALERTS.map((alert, index) => (
              <div
                className={`alert-card ${alert.type}`}
                key={index}
              >
                <div className="alert-indicator">
                  {alert.icon}
                </div>

                <div className="alert-main">
                  <div className="alert-title-row">
                    <strong>{alert.title}</strong>
                    <span>{alert.time}</span>
                  </div>

                  <b>ROUTE {alert.route}</b>

                  <p>{alert.description}</p>
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    selectRoute(
                      ROUTES.find(
                        (route) => route.id === alert.route
                      ) || ROUTES[0]
                    )
                  }
                >
                  Inspect →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* =================================================
            SYSTEM HEALTH
        ================================================= */}

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                PLATFORM STATUS
              </span>
              <h2>System health</h2>
            </div>

            <span className="data-badge">ALL SYSTEMS</span>
          </div>

          <div className="system-health-grid">
            <HealthCard
              title="AI Prediction Engine"
              description="Forecasting model responding normally."
              status="Operational"
            />

            <HealthCard
              title="Live Bus Telemetry"
              description="56 active vehicle signals received."
              status="Operational"
            />

            <HealthCard
              title="Passenger Data Pipeline"
              description="Anonymized data processing active."
              status="Operational"
            />

            <HealthCard
              title="Model Monitoring"
              description="Minor latency detected in one node."
              status="Watch"
              warning
            />
          </div>

          <div className="architecture">
            <ArchitectureStep
              number="01"
              title="Collect"
              text="Gather anonymized passenger and vehicle signals."
            />

            <ArchitectureStep
              number="02"
              title="Process"
              text="Normalize live data and identify crowd patterns."
            />

            <ArchitectureStep
              number="03"
              title="Predict"
              text="AI estimates occupancy for upcoming time windows."
            />

            <ArchitectureStep
              number="04"
              title="Act"
              text="Operators receive clear recommendations and alerts."
            />
          </div>
        </section>

        <footer>
          <div>
            <strong>CrowdWise</strong>
            <span>AI-powered public transport intelligence</span>
          </div>

          <div className="footer-center">
            Model v2.4.1 · Data refreshed {formattedTime}
          </div>

          <div>
            <span>Privacy-first architecture</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  icon,
  label,
  value,
  sub,
  danger = false,
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>

      <span className="metric-label">{label}</span>

      <strong className={danger ? "danger-text" : ""}>
        {value}
      </strong>

      <span>{sub}</span>
    </div>
  );
}

function DecisionSupport({ route, predictionValue }) {
  const status = getPredictionStatus(predictionValue);

  let title = "Network operating within target";
  let description =
    "Passenger demand is currently manageable. Continue standard monitoring across the active network.";

  if (status === "moderate") {
    title = "Demand beginning to rise";
    description =
      "CrowdWise detects increasing passenger demand. Monitor the selected corridor before the next peak window.";
  }

  if (status === "high") {
    title = "Prepare for elevated demand";
    description =
      "The AI model expects high occupancy. Consider increasing vehicle frequency on the selected route.";
  }

  if (status === "critical") {
    title = "Immediate capacity attention recommended";
    description =
      "Predicted occupancy is close to operational capacity. Dispatch planning should prioritize this corridor.";
  }

  return (
    <div className="decision-panel">
      <div className="decision-icon">✦</div>

      <div className="decision-copy">
        <span className="eyebrow">AI DECISION SUPPORT</span>

        <h3>{title}</h3>

        <p>
          {description} Current focus:{" "}
          <strong style={{ color: "#b9c4b8" }}>
            Route {route.id}
          </strong>
          .
        </p>
      </div>

      <span
        className={`status-pill ${getStatusClass(status)}`}
      >
        {getStatusLabel(status)}
      </span>
    </div>
  );
}

function InfoStat({ label, value }) {
  return (
    <div className="info-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HealthCard({
  title,
  description,
  status,
  warning = false,
}) {
  return (
    <div className="health-card">
      <span className={`health-dot ${warning ? "warning" : ""}`} />

      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>

      <span
        className={`health-status ${
          warning ? "warning" : ""
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function ArchitectureStep({ number, title, text }) {
  return (
    <div className="architecture-step">
      <span className="architecture-number">{number}</span>

      <strong>{title}</strong>

      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   NETWORK VISUALIZATION
========================================================= */

function NetworkMap({
  routes,
  selectedRoute,
  onSelectRoute,
}) {
  const positions = [
    { x: 18, y: 72 },
    { x: 30, y: 55 },
    { x: 44, y: 62 },
    { x: 56, y: 42 },
    { x: 69, y: 52 },
    { x: 82, y: 30 },
  ];

  return (
    <div
      className="map-placeholder"
      style={{
        minHeight: "470px",
      }}
    >
      <div className="map-grid" />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.7,
        }}
      >
        <path
          d="M10 78 L28 60 L43 64 L57 43 L70 52 L88 28"
          fill="none"
          stroke="#3c4a31"
          strokeWidth="0.8"
        />

        <path
          d="M20 30 L34 52 L57 43 L73 74"
          fill="none"
          stroke="#26332a"
          strokeWidth="0.6"
        />

        <path
          d="M15 85 L43 64 L70 52 L88 65"
          fill="none"
          stroke="#26332a"
          strokeWidth="0.6"
        />
      </svg>

      {positions.map((position, index) => {
        const route = routes[index];

        return (
          <button
            key={route.id}
            onClick={() => onSelectRoute(route)}
            title={`${route.id} · ${route.occupancy}%`}
            style={{
              position: "absolute",
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: "translate(-50%, -50%)",
              width:
                selectedRoute.id === route.id ? "52px" : "42px",
              height:
                selectedRoute.id === route.id ? "52px" : "42px",
              borderRadius: "50%",
              border:
                selectedRoute.id === route.id
                  ? "2px solid #eaff4f"
                  : "1px solid #34412d",
              background:
                selectedRoute.id === route.id
                  ? "#172014"
                  : "#101712",
              color:
                route.status === "critical"
                  ? "#ed656d"
                  : route.status === "high"
                    ? "#e5a04e"
                    : route.status === "moderate"
                      ? "#e5d05d"
                      : "#72d58b",
              cursor: "pointer",
              zIndex: 5,
              boxShadow:
                selectedRoute.id === route.id
                  ? "0 0 28px rgba(234,255,79,.16)"
                  : "none",
              transition: "all .25s ease",
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize:
                  selectedRoute.id === route.id
                    ? "10px"
                    : "8px",
              }}
            >
              {route.id}
            </strong>

            <small
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "6px",
                opacity: 0.75,
              }}
            >
              {route.occupancy}%
            </small>
          </button>
        );
      })}

      <div className="map-center">
        <div className="map-pulse">⌁</div>

        <strong>Chennai Network</strong>

        <span>
          Live route intelligence across the monitored bus
          network.
        </span>

        <span
          className="status-pill status-low"
          style={{
            border: "1px solid #273528",
          }}
        >
          ● SYSTEM ONLINE
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: "18px",
          bottom: "16px",
          padding: "8px 10px",
          border: "1px solid #222c34",
          borderRadius: "7px",
          background: "rgba(8,12,17,.9)",
          color: "#657181",
          fontSize: "7px",
          letterSpacing: ".5px",
        }}
      >
        LIVE NETWORK VIEW · {routes.length} ROUTES
      </div>
    </div>
  );
}

export default App;