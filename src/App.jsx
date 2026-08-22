import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SplashScreen from "./pages/SplashScreen";
import Profile from "./pages/Profile";
import History from "./pages/History";
import LiveTracking from "./pages/LiveTracking";

import { supabase } from "./supabaseClient";

/* =========================================================
   MAP ICONS
========================================================= */

const userIcon = new L.DivIcon({
  className: "crowdwiseUserMarker",
  html: `
    <div class="userMarkerInner">
      📍
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const busIcon = new L.DivIcon({
  className: "crowdwiseBusMarker",
  html: `
    <div class="busMarkerInner">
      🚌
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

/* =========================================================
   BUS DATA
========================================================= */

const BUS_STOPS = [
  {
    name: "Tambaram",
    lat: 12.9249,
    lng: 80.1,
  },
  {
    name: "Chromepet",
    lat: 12.9516,
    lng: 80.1462,
  },
  {
    name: "Pallavaram",
    lat: 12.9675,
    lng: 80.1491,
  },
  {
    name: "Guindy",
    lat: 13.0103,
    lng: 80.212,
  },
  {
    name: "Saidapet",
    lat: 13.0231,
    lng: 80.2205,
  },
  {
    name: "T Nagar",
    lat: 13.0418,
    lng: 80.2337,
  },
  {
    name: "Anna Salai",
    lat: 13.0569,
    lng: 80.2425,
  },
  {
    name: "Broadway",
    lat: 13.0985,
    lng: 80.2896,
  },
];

/* =========================================================
   ROUTE DATA
========================================================= */

const ROUTES = [
  {
    id: "21G",
    name: "Tambaram → Broadway",
    occupancy: 68,
    capacity: 70,
    status: "Moderate",
    color: "green",
  },
  {
    id: "102",
    name: "Tambaram → Broadway",
    occupancy: 82,
    capacity: 70,
    status: "High",
    color: "orange",
  },
  {
    id: "70",
    name: "Guindy → T Nagar",
    occupancy: 48,
    capacity: 70,
    status: "Low",
    color: "green",
  },
  {
    id: "60A",
    name: "Tambaram → Guindy",
    occupancy: 76,
    capacity: 70,
    status: "High",
    color: "orange",
  },
  {
    id: "5E",
    name: "Saidapet → Broadway",
    occupancy: 91,
    capacity: 70,
    status: "Critical",
    color: "red",
  },
];

/* =========================================================
   ANALYTICS DATA
========================================================= */

const HOURLY_DATA = [
  {
    time: "06 AM",
    crowd: 32,
  },
  {
    time: "07 AM",
    crowd: 48,
  },
  {
    time: "08 AM",
    crowd: 78,
  },
  {
    time: "09 AM",
    crowd: 84,
  },
  {
    time: "10 AM",
    crowd: 66,
  },
  {
    time: "11 AM",
    crowd: 54,
  },
  {
    time: "12 PM",
    crowd: 49,
  },
  {
    time: "01 PM",
    crowd: 45,
  },
  {
    time: "02 PM",
    crowd: 51,
  },
  {
    time: "03 PM",
    crowd: 57,
  },
  {
    time: "04 PM",
    crowd: 64,
  },
  {
    time: "05 PM",
    crowd: 81,
  },
  {
    time: "06 PM",
    crowd: 92,
  },
  {
    time: "07 PM",
    crowd: 87,
  },
];

const WEEK_DATA = [
  {
    day: "Mon",
    crowd: 72,
  },
  {
    day: "Tue",
    crowd: 76,
  },
  {
    day: "Wed",
    crowd: 68,
  },
  {
    day: "Thu",
    crowd: 82,
  },
  {
    day: "Fri",
    crowd: 88,
  },
  {
    day: "Sat",
    crowd: 56,
  },
  {
    day: "Sun",
    crowd: 42,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getCrowdStatus(value) {
  if (value >= 85) return "Critical";
  if (value >= 70) return "High";
  if (value >= 50) return "Moderate";
  return "Low";
}

function getCrowdClass(value) {
  if (value >= 85) return "critical";
  if (value >= 70) return "high";
  if (value >= 50) return "moderate";
  return "low";
}

/* =========================================================
   PROTECTED ROUTE
========================================================= */

function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================================================
   LAYOUT
========================================================= */

function AppLayout({
  user,
  onLogout,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const navigationItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      path: "/live-tracking",
      label: "Live Tracking",
      icon: "📍",
    },
    {
      path: "/prediction",
      label: "AI Prediction",
      icon: "🧠",
    },
    {
      path: "/routes",
      label: "Route Intelligence",
      icon: "🛣️",
    },
    {
      path: "/analytics",
      label: "Analytics",
      icon: "📊",
    },
    {
      path: "/alerts",
      label: "Alerts",
      icon: "🔔",
    },
    {
      path: "/history",
      label: "Travel History",
      icon: "🕐",
    },
    {
      path: "/profile",
      label: "Profile",
      icon: "👤",
    },
  ];

  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div className="appShell">
      {sidebarOpen && (
        <div
          className="mobileSidebarOverlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={
          sidebarOpen
            ? "sidebar sidebarOpen"
            : "sidebar"
        }
      >
        <div className="sidebarBrand">
          <div className="brandLogo">
            CW
          </div>

          <div>
            <h2>CrowdWise</h2>
            <span>AI TRANSPORT</span>
          </div>

          <button
            className="mobileCloseSidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            ×
          </button>
        </div>

        <div className="sidebarUser">
          <div className="sidebarAvatar">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "C"}
          </div>

          <div>
            <strong>
              {user?.name ||
                "CrowdWise Student"}
            </strong>

            <span>
              {user?.role || "Student"}
            </span>
          </div>
        </div>

        <nav className="sidebarNavigation">
          <span className="navSectionTitle">
            MAIN MENU
          </span>

          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavigation}
              className={
                isActive(item.path)
                  ? "sidebarLink active"
                  : "sidebarLink"
              }
            >
              <span className="navIcon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebarBottom">
          <div className="systemMiniStatus">
            <span className="systemStatusDot"></span>

            <div>
              <strong>
                System Operational
              </strong>

              <small>
                All services online
              </small>
            </div>
          </div>

          <button
            className="sidebarLogout"
            onClick={() => {
              onLogout();
              navigate("/login");
            }}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="mainArea">
        <header className="topBar">
          <button
            className="mobileMenuButton"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            ☰
          </button>

          <div className="topBarTitle">
            <span>
              CROWDSENSE INTELLIGENCE
            </span>
          </div>

          <div className="topBarActions">
            <button
              className="topBarIconButton"
              onClick={() =>
                navigate("/alerts")
              }
            >
              🔔
              <span className="notificationDot"></span>
            </button>

            <button
              className="topProfileButton"
              onClick={() =>
                navigate("/profile")
              }
            >
              <div className="topAvatar">
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "C"}
              </div>

              <span>
                {user?.name ||
                  "Student"}
              </span>
            </button>
          </div>
        </header>

        <div className="pageContent">
          {children}
        </div>

        <nav className="mobileBottomNav">
          {navigationItems
            .slice(0, 5)
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={
                  isActive(item.path)
                    ? "mobileNavItem active"
                    : "mobileNavItem"
                }
              >
                <span>
                  {item.icon}
                </span>

                <small>
                  {item.label ===
                  "Live Tracking"
                    ? "Live"
                    : item.label}
                </small>
              </NavLink>
            ))}
        </nav>
      </main>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [location, setLocation] =
    useState({
      lat: 12.9249,
      lng: 80.1,
    });

  const [gpsActive, setGpsActive] =
    useState(false);

  const [busIndex, setBusIndex] =
    useState(2);

  const [busPosition, setBusPosition] =
    useState({
      lat: BUS_STOPS[2].lat,
      lng: BUS_STOPS[2].lng,
    });

  const [busSpeed, setBusSpeed] =
    useState(38);

  const [networkLoad, setNetworkLoad] =
    useState(64);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  /* USER GPS */

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });

          setGpsActive(true);
        },
        () => {
          setGpsActive(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, []);

  /* BUS MOVEMENT */

  useEffect(() => {
    const timer = setInterval(() => {
      setBusIndex((previous) => {
        const next =
          (previous + 1) %
          BUS_STOPS.length;

        setBusPosition({
          lat: BUS_STOPS[next].lat,
          lng: BUS_STOPS[next].lng,
        });

        setBusSpeed(
          Math.floor(
            Math.random() * 15
          ) + 30
        );

        return next;
      });
    }, 3000);

    return () =>
      clearInterval(timer);
  }, []);

  /* CLOCK */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date()
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, []);

  /* NETWORK */

  useEffect(() => {
    setNetworkLoad(
      Math.floor(
        Math.random() * 31
      ) + 45
    );
  }, []);

  const currentRoute =
    ROUTES[0];

  return (
    <div className="dashboardPage">
      <div className="dashboardHero">
        <div>
          <span className="sectionEyebrow">
            SATURDAY • AUGUST 22, 2026
          </span>

          <h1>
            Good morning,
            <br />
            <span>
              Transport Intelligence
            </span>
          </h1>

          <p>
            Monitor Chennai's public
            transport network with
            real-time AI insights.
          </p>
        </div>

        <div className="dashboardClock">
          <span>LOCAL TIME</span>

          <strong>
            {currentTime.toLocaleTimeString(
              "en-IN",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </strong>

          <small>
            {gpsActive
              ? "● GPS Connected"
              : "○ GPS Demo Mode"}
          </small>
        </div>
      </div>

      {/* KPI */}

      <div className="kpiGrid">
        <div className="kpiCard">
          <div className="kpiIcon">
            🚌
          </div>

          <span>Active Buses</span>

          <strong>142</strong>

          <small className="positive">
            ↑ 8.4% from yesterday
          </small>
        </div>

        <div className="kpiCard">
          <div className="kpiIcon">
            👥
          </div>

          <span>Network Occupancy</span>

          <strong>
            {currentRoute.occupancy}%
          </strong>

          <small>
            Current network average
          </small>
        </div>

        <div className="kpiCard">
          <div className="kpiIcon">
            🧠
          </div>

          <span>AI Accuracy</span>

          <strong>94.2%</strong>

          <small className="positive">
            ↑ 2.1% this week
          </small>
        </div>

        <div className="kpiCard">
          <div className="kpiIcon">
            ⚡
          </div>

          <span>Network Load</span>

          <strong>
            {networkLoad}%
          </strong>

          <small>
            Real-time system load
          </small>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="dashboardMainGrid">
        <section className="dashboardMapCard">
          <div className="cardHeader">
            <div>
              <span className="sectionEyebrow">
                LIVE NETWORK
              </span>

              <h2>
                Chennai Bus Network
              </h2>
            </div>

            <button
              className="viewAllButton"
              onClick={() =>
                navigate(
                  "/live-tracking"
                )
              }
            >
              Full Map →
            </button>
          </div>

          <div className="dashboardMap">
            <MapContainer
              center={[
                location.lat,
                location.lng,
              ]}
              zoom={11}
              style={{
                height: "430px",
                width: "100%",
              }}
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Circle
                center={[
                  location.lat,
                  location.lng,
                ]}
                radius={120}
                pathOptions={{
                  color:
                    "#00ff88",
                  fillColor:
                    "#00ff88",
                  fillOpacity:
                    0.2,
                }}
              />

              <Marker
                position={[
                  location.lat,
                  location.lng,
                ]}
                icon={userIcon}
              >
                <Popup>
                  <strong>
                    📍 You are here
                  </strong>
                </Popup>
              </Marker>

              <Marker
                position={[
                  busPosition.lat,
                  busPosition.lng,
                ]}
                icon={busIcon}
              >
                <Popup>
                  <strong>
                    🚌 Route 21G
                  </strong>

                  <br />

                  Speed:{" "}
                  {busSpeed} km/h
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="mapFooter">
            <div>
              <span className="legendDot live"></span>
              Live Bus
            </div>

            <div>
              <span className="legendDot user"></span>
              Your Location
            </div>

            <div>
              <span className="legendDot route"></span>
              AI Monitored
            </div>

            <button
              onClick={() =>
                navigate(
                  "/live-tracking"
                )
              }
            >
              Open Live Tracking
            </button>
          </div>
        </section>

        {/* AI PREDICTION */}

        <section className="predictionCard">
          <div className="cardHeader">
            <div>
              <span className="sectionEyebrow">
                AI ENGINE
              </span>

              <h2>
                Crowd Prediction
              </h2>
            </div>

            <span className="aiBadge">
              AI
            </span>
          </div>

          <div className="predictionRoute">
            <span>21G</span>

            <div>
              <strong>
                Tambaram
              </strong>

              <span>→</span>

              <strong>
                Broadway
              </strong>
            </div>
          </div>

          <div className="predictionCircle">
            <div>
              <strong>
                68%
              </strong>

              <span>
                OCCUPANCY
              </span>
            </div>
          </div>

          <div className="predictionStatus moderate">
            <span></span>

            Moderate Crowd
          </div>

          <p>
            AI predicts moderate crowd
            density for the next 15
            minutes.
          </p>

          <div className="confidence">
            <div>
              <span>
                Prediction Confidence
              </span>

              <strong>
                94%
              </strong>
            </div>

            <div className="confidenceBar">
              <span
                style={{
                  width: "94%",
                }}
              ></span>
            </div>
          </div>

          <button
            className="primaryFullButton"
            onClick={() =>
              navigate(
                "/prediction"
              )
            }
          >
            View Full Prediction →
          </button>
        </section>
      </div>

      {/* ROUTES */}

      <section className="dashboardSection">
        <div className="sectionHeader">
          <div>
            <span className="sectionEyebrow">
              ROUTE INTELLIGENCE
            </span>

            <h2>
              Network Overview
            </h2>
          </div>

          <button
            onClick={() =>
              navigate("/routes")
            }
          >
            View All Routes →
          </button>
        </div>

        <div className="routeCards">
          {ROUTES.slice(0, 4).map(
            (route) => (
              <div
                className="routeCard"
                key={route.id}
              >
                <div className="routeCardTop">
                  <div className="routeNumber">
                    {route.id}
                  </div>

                  <span
                    className={`statusBadge ${getCrowdClass(
                      route.occupancy
                    )}`}
                  >
                    {getCrowdStatus(
                      route.occupancy
                    )}
                  </span>
                </div>

                <h3>
                  {route.name}
                </h3>

                <div className="routeOccupancy">
                  <div>
                    <span>
                      Occupancy
                    </span>

                    <strong>
                      {route.occupancy}%
                    </strong>
                  </div>

                  <div className="occupancyBar">
                    <span
                      style={{
                        width: `${route.occupancy}%`,
                      }}
                    ></span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* BOTTOM */}

      <div className="dashboardBottomGrid">
        <section className="quickActionsCard">
          <div className="cardHeader">
            <div>
              <span className="sectionEyebrow">
                QUICK ACCESS
              </span>

              <h2>
                Transport Tools
              </h2>
            </div>
          </div>

          <div className="quickActions">
            <button
              onClick={() =>
                navigate(
                  "/live-tracking"
                )
              }
            >
              <span>📍</span>
              <strong>
                Live Tracking
              </strong>
              <small>
                Track buses
              </small>
            </button>

            <button
              onClick={() =>
                navigate(
                  "/prediction"
                )
              }
            >
              <span>🧠</span>
              <strong>
                AI Prediction
              </strong>
              <small>
                Predict crowd
              </small>
            </button>

            <button
              onClick={() =>
                navigate(
                  "/history"
                )
              }
            >
              <span>🕐</span>
              <strong>
                Trip History
              </strong>
              <small>
                View journeys
              </small>
            </button>

            <button
              onClick={() =>
                navigate(
                  "/analytics"
                )
              }
            >
              <span>📊</span>
              <strong>
                Analytics
              </strong>
              <small>
                Network insights
              </small>
            </button>
          </div>
        </section>

        <section className="alertsPreviewCard">
          <div className="cardHeader">
            <div>
              <span className="sectionEyebrow">
                SYSTEM ALERTS
              </span>

              <h2>
                Live Alerts
              </h2>
            </div>

            <button
              onClick={() =>
                navigate("/alerts")
              }
            >
              View All
            </button>
          </div>

          <div className="alertPreview">
            <span className="alertIcon warning">
              !
            </span>

            <div>
              <strong>
                Route 5E crowd spike
              </strong>

              <p>
                Occupancy reached 91%.
              </p>
            </div>

            <small>
              2m
            </small>
          </div>

          <div className="alertPreview">
            <span className="alertIcon normal">
              ✓
            </span>

            <div>
              <strong>
                GPS services online
              </strong>

              <p>
                All tracking systems
                operational.
              </p>
            </div>

            <small>
              5m
            </small>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   AI PREDICTION PAGE
========================================================= */

function PredictionPage() {
  const [selectedRoute, setSelectedRoute] =
    useState(ROUTES[0]);

  const [prediction, setPrediction] =
    useState(68);

  const [confidence, setConfidence] =
    useState(94);

  const generatePrediction = () => {
    const newValue =
      Math.floor(
        Math.random() * 50
      ) + 40;

    const newConfidence =
      Math.floor(
        Math.random() * 8
      ) + 90;

    setPrediction(newValue);
    setConfidence(
      newConfidence
    );
  };

  return (
    <div className="predictionPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            ARTIFICIAL INTELLIGENCE
          </span>

          <h1>
            AI Crowd Prediction
          </h1>

          <p>
            Predict bus occupancy using
            route, time and historical
            transport patterns.
          </p>
        </div>

        <button
          className="primaryButton"
          onClick={
            generatePrediction
          }
        >
          ✨ Generate Prediction
        </button>
      </div>

      <div className="predictionControls">
        <span>
          Select Route
        </span>

        <div className="routeSelector">
          {ROUTES.map((route) => (
            <button
              key={route.id}
              className={
                selectedRoute.id ===
                route.id
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setSelectedRoute(
                  route
                )
              }
            >
              {route.id}
            </button>
          ))}
        </div>
      </div>

      <div className="predictionDashboardGrid">
        <section className="largePredictionCard">
          <span className="sectionEyebrow">
            CURRENT PREDICTION
          </span>

          <h2>
            Route {selectedRoute.id}
          </h2>

          <p>
            {selectedRoute.name}
          </p>

          <div className="largePredictionCircle">
            <div>
              <strong>
                {prediction}%
              </strong>

              <span>
                PREDICTED
              </span>
            </div>
          </div>

          <div
            className={`largePredictionStatus ${getCrowdClass(
              prediction
            )}`}
          >
            {getCrowdStatus(
              prediction
            )} Crowd
          </div>
        </section>

        <section className="predictionFactors">
          <span className="sectionEyebrow">
            MODEL ANALYSIS
          </span>

          <h2>
            Prediction Factors
          </h2>

          <div className="factor">
            <div>
              <span>
                Historical Demand
              </span>

              <strong>
                82%
              </strong>
            </div>

            <div className="factorBar">
              <span
                style={{
                  width: "82%",
                }}
              ></span>
            </div>
          </div>

          <div className="factor">
            <div>
              <span>
                Current Time
              </span>

              <strong>
                76%
              </strong>
            </div>

            <div className="factorBar">
              <span
                style={{
                  width: "76%",
                }}
              ></span>
            </div>
          </div>

          <div className="factor">
            <div>
              <span>
                Route Demand
              </span>

              <strong>
                88%
              </strong>
            </div>

            <div className="factorBar">
              <span
                style={{
                  width: "88%",
                }}
              ></span>
            </div>
          </div>

          <div className="factor">
            <div>
              <span>
                Weekday Pattern
              </span>

              <strong>
                91%
              </strong>
            </div>

            <div className="factorBar">
              <span
                style={{
                  width: "91%",
                }}
              ></span>
            </div>
          </div>

          <div className="modelConfidence">
            <span>
              Model Confidence
            </span>

            <strong>
              {confidence}%
            </strong>
          </div>
        </section>
      </div>

      <section className="forecastSection">
        <div className="sectionHeader">
          <div>
            <span className="sectionEyebrow">
              FORECAST
            </span>

            <h2>
              Next 60 Minutes
            </h2>
          </div>
        </div>

        <div className="forecastCards">
          {[
            ["Now", prediction],
            ["+15 min", Math.min(99, prediction + 7)],
            ["+30 min", Math.min(99, prediction + 4)],
            ["+45 min", Math.max(25, prediction - 5)],
            ["+60 min", Math.max(20, prediction - 10)],
          ].map(
            ([time, value]) => (
              <div
                className="forecastCard"
                key={time}
              >
                <span>
                  {time}
                </span>

                <strong>
                  {value}%
                </strong>

                <small
                  className={getCrowdClass(
                    value
                  )}
                >
                  {getCrowdStatus(
                    value
                  )}
                </small>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   ROUTE INTELLIGENCE
========================================================= */

function RoutesPage() {
  const [search, setSearch] =
    useState("");

  const filteredRoutes =
    ROUTES.filter((route) =>
      `${route.id} ${route.name}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="routesPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            TRANSPORT NETWORK
          </span>

          <h1>
            Route Intelligence
          </h1>

          <p>
            Monitor crowd levels across
            major Chennai bus routes.
          </p>
        </div>

        <div className="routeSearch">
          🔎
          <input
            placeholder="Search route..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
      </div>

      <div className="routeIntelligenceGrid">
        {filteredRoutes.map(
          (route) => (
            <div
              className="intelligenceRouteCard"
              key={route.id}
            >
              <div className="intelligenceTop">
                <div className="bigRouteNumber">
                  {route.id}
                </div>

                <span
                  className={`statusBadge ${getCrowdClass(
                    route.occupancy
                  )}`}
                >
                  {getCrowdStatus(
                    route.occupancy
                  )}
                </span>
              </div>

              <h2>
                {route.name}
              </h2>

              <div className="routeMetric">
                <span>
                  Current Occupancy
                </span>

                <strong>
                  {route.occupancy}%
                </strong>
              </div>

              <div className="largeOccupancyBar">
                <span
                  style={{
                    width: `${route.occupancy}%`,
                  }}
                ></span>
              </div>

              <div className="routeCardDetails">
                <div>
                  <span>
                    Capacity
                  </span>

                  <strong>
                    {route.capacity}
                    passengers
                  </strong>
                </div>

                <div>
                  <span>
                    Prediction
                  </span>

                  <strong>
                    94%
                  </strong>
                </div>
              </div>

              <button className="routeDetailsButton">
                View Route Intelligence →
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS PAGE
========================================================= */

function AnalyticsPage() {
  return (
    <div className="analyticsPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            NETWORK ANALYTICS
          </span>

          <h1>
            Transport Analytics
          </h1>

          <p>
            Historical and real-time
            crowd intelligence.
          </p>
        </div>
      </div>

      <div className="analyticsKpis">
        <div>
          <span>
            Average Occupancy
          </span>

          <strong>
            68.4%
          </strong>

          <small>
            +4.2% this week
          </small>
        </div>

        <div>
          <span>
            Peak Hour
          </span>

          <strong>
            6:00 PM
          </strong>

          <small>
            Highest demand
          </small>
        </div>

        <div>
          <span>
            Buses Monitored
          </span>

          <strong>
            142
          </strong>

          <small>
            Live network
          </small>
        </div>

        <div>
          <span>
            AI Accuracy
          </span>

          <strong>
            94.2%
          </strong>

          <small>
            Model performance
          </small>
        </div>
      </div>

      <div className="chartsGrid">
        <section className="chartCard">
          <div className="cardHeader">
            <div>
              <span className="sectionEyebrow">
                HOURLY DEMAND
              </span>

              <h2>
                Crowd Level
              </h2>
            </div>
          </div>

          <div className="chartContainer">
            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <LineChart
                data={HOURLY_DATA}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.15}
                />

                <XAxis
                  dataKey="time"
                />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="crowd"
                  stroke="#65ff8f"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="chartCard">
          <div className="cardHeader">
            <div>
              <span className="sectionEyebrow">
                WEEKLY TREND
              </span>

              <h2>
                Average Crowd
              </h2>
            </div>
          </div>

          <div className="chartContainer">
            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <BarChart
                data={WEEK_DATA}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={0.15}
                />

                <XAxis
                  dataKey="day"
                />

                <YAxis />

                <Tooltip />

                <Bar
                  dataKey="crowd"
                  fill="#65ff8f"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   ALERTS PAGE
========================================================= */

function AlertsPage() {
  const alerts = [
    {
      type: "critical",
      icon: "🚨",
      title:
        "Critical crowd detected",
      description:
        "Route 5E has reached 91% occupancy.",
      time: "2 minutes ago",
    },
    {
      type: "warning",
      icon: "⚠️",
      title:
        "High crowd prediction",
      description:
        "Route 102 is expected to exceed 80% occupancy.",
      time: "8 minutes ago",
    },
    {
      type: "normal",
      icon: "✓",
      title:
        "GPS system operational",
      description:
        "Live tracking services are working normally.",
      time: "15 minutes ago",
    },
    {
      type: "normal",
      icon: "✓",
      title:
        "AI model updated",
      description:
        "Crowd prediction model successfully refreshed.",
      time: "32 minutes ago",
    },
  ];

  return (
    <div className="alertsPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            SYSTEM MONITORING
          </span>

          <h1>
            Notification Center
          </h1>

          <p>
            Real-time transport and AI
            system alerts.
          </p>
        </div>

        <div className="alertCountBadge">
          2 Active Alerts
        </div>
      </div>

      <div className="alertsList">
        {alerts.map(
          (alert, index) => (
            <div
              className={`fullAlertCard ${alert.type}`}
              key={index}
            >
              <div className="fullAlertIcon">
                {alert.icon}
              </div>

              <div className="fullAlertContent">
                <h3>
                  {alert.title}
                </h3>

                <p>
                  {alert.description}
                </p>

                <small>
                  {alert.time}
                </small>
              </div>

              <span
                className={`alertSeverity ${alert.type}`}
              >
                {alert.type}
              </span>
            </div>
          )
        )}
      </div>

      <section className="systemHealthCard">
        <div className="cardHeader">
          <div>
            <span className="sectionEyebrow">
              SYSTEM STATUS
            </span>

            <h2>
              CrowdWise Health
            </h2>
          </div>

          <span className="healthyBadge">
            ● ALL SYSTEMS OPERATIONAL
          </span>
        </div>

        <div className="healthGrid">
          <div>
            <span>
              GPS Services
            </span>

            <strong>
              Operational
            </strong>
          </div>

          <div>
            <span>
              AI Prediction
            </span>

            <strong>
              Operational
            </strong>
          </div>

          <div>
            <span>
              Database
            </span>

            <strong>
              Operational
            </strong>
          </div>

          <div>
            <span>
              API Services
            </span>

            <strong>
              Operational
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   SETTINGS PAGE
========================================================= */

function SettingsPage() {
  const [language, setLanguage] =
    useState(
      localStorage.getItem(
        "crowdwise_language"
      ) || "English"
    );

  const [notifications, setNotifications] =
    useState(true);

  const [autoGPS, setAutoGPS] =
    useState(true);

  const changeLanguage = (
    value
  ) => {
    setLanguage(value);

    localStorage.setItem(
      "crowdwise_language",
      value
    );
  };

  return (
    <div className="settingsPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            PREFERENCES
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Customize your CrowdWise
            experience.
          </p>
        </div>
      </div>

      <div className="settingsCards">
        <section className="settingsCard">
          <div className="settingsCardHeader">
            <span>
              🎨
            </span>

            <div>
              <h2>
                Appearance
              </h2>

              <p>
                CrowdWise currently uses
                the premium dark interface.
              </p>
            </div>
          </div>

          <div className="settingsOption">
            <div>
              <strong>
                Dark Interface
              </strong>

              <small>
                Optimized for dashboards
                and night travel.
              </small>
            </div>

            <div className="settingsToggle active">
              <span></span>
            </div>
          </div>
        </section>

        <section className="settingsCard">
          <div className="settingsCardHeader">
            <span>
              🌐
            </span>

            <div>
              <h2>
                Language
              </h2>

              <p>
                Select your preferred
                interface language.
              </p>
            </div>
          </div>

          <div className="languageOptions">
            {[
              "English",
              "Tamil",
            ].map((item) => (
              <button
                key={item}
                className={
                  language === item
                    ? "languageButton active"
                    : "languageButton"
                }
                onClick={() =>
                  changeLanguage(
                    item
                  )
                }
              >
                {item ===
                "Tamil"
                  ? "தமிழ்"
                  : "English"}
              </button>
            ))}
          </div>
        </section>

        <section className="settingsCard">
          <div className="settingsCardHeader">
            <span>
              🔔
            </span>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Control CrowdWise
                transport alerts.
              </p>
            </div>
          </div>

          <div className="settingsOption">
            <div>
              <strong>
                Crowd Alerts
              </strong>

              <small>
                Receive notifications when
                buses become crowded.
              </small>
            </div>

            <button
              className={
                notifications
                  ? "settingsToggle active"
                  : "settingsToggle"
              }
              onClick={() =>
                setNotifications(
                  !notifications
                )
              }
            >
              <span></span>
            </button>
          </div>

          <div className="settingsOption">
            <div>
              <strong>
                Automatic GPS
              </strong>

              <small>
                Automatically request
                location when tracking.
              </small>
            </div>

            <button
              className={
                autoGPS
                  ? "settingsToggle active"
                  : "settingsToggle"
              }
              onClick={() =>
                setAutoGPS(
                  !autoGPS
                )
              }
            >
              <span></span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APPLICATION
========================================================= */

function MainApp() {
  const [user, setUser] =
    useState(null);

  const [splashFinished, setSplashFinished] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

  /* LOAD LOCAL USER */

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          if (supabase) {
            const {
              data,
            } =
              await supabase.auth.getUser();

            if (data?.user) {
              setUser({
                id: data.user.id,
                email:
                  data.user.email,
                name:
                  data.user.user_metadata
                    ?.full_name ||
                  data.user.email
                    ?.split("@")[0],
                phone:
                  data.user.user_metadata
                    ?.phone || "",
                role: "Student",
              });

              setLoadingUser(false);

              return;
            }
          }
        } catch (error) {
          console.log(
            "Supabase session check:",
            error
          );
        }

        const localUser =
          localStorage.getItem(
            "crowdwise_user"
          );

        if (localUser) {
          try {
            setUser(
              JSON.parse(
                localUser
              )
            );
          } catch {
            localStorage.removeItem(
              "crowdwise_user"
            );
          }
        }

        setLoadingUser(false);
      };

    loadUser();
  }, []);

  /* SUPABASE AUTH LISTENER */

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            const newUser = {
              id:
                session.user.id,
              email:
                session.user.email,
              name:
                session.user
                  .user_metadata
                  ?.full_name ||
                session.user.email
                  ?.split("@")[0],
              phone:
                session.user
                  .user_metadata
                  ?.phone || "",
              role: "Student",
            };

            setUser(newUser);

            localStorage.setItem(
              "crowdwise_user",
              JSON.stringify(
                newUser
              )
            );
          }
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (
    loggedUser
  ) => {
    setUser(loggedUser);

    if (loggedUser) {
      localStorage.setItem(
        "crowdwise_user",
        JSON.stringify(
          loggedUser
        )
      );
    }
  };

  const handleSignup = (
    newUser
  ) => {
    setUser(newUser);

    if (newUser) {
      localStorage.setItem(
        "crowdwise_user",
        JSON.stringify(
          newUser
        )
      );
    }
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(
        "Logout error:",
        error
      );
    }

    localStorage.removeItem(
      "crowdwise_user"
    );

    setUser(null);
  };

  if (
    !splashFinished
  ) {
    return (
      <SplashScreen
        onComplete={() =>
          setSplashFinished(
            true
          )
        }
      />
    );
  }

  if (loadingUser) {
    return (
      <div className="appLoadingScreen">
        <div className="loadingLogo">
          CW
        </div>

        <div className="loadingSpinner"></div>

        <p>
          Loading CrowdWise AI...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC */}

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to="/"
              replace
            />
          ) : (
            <Login
              onLogin={
                handleLogin
              }
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate
              to="/"
              replace
            />
          ) : (
            <Signup
              onSignup={
                handleSignup
              }
            />
          )
        }
      />

      {/* PROTECTED */}

      <Route
        path="/"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/live-tracking"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <LiveTracking />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/prediction"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <PredictionPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/routes"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <RoutesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <AnalyticsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/alerts"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <AlertsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <History />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <Profile
                user={user}
                onLogout={
                  handleLogout
                }
              />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute
            user={user}
          >
            <AppLayout
              user={user}
              onLogout={
                handleLogout
              }
            >
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}

      <Route
        path="*"
        element={
          <Navigate
            to={
              user
                ? "/"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}

/* =========================================================
   ROOT APP
========================================================= */

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}