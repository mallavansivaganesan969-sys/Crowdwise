import React, {
  useEffect,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

const trackingBusIcon =
  new L.DivIcon({
    className:
      "cwTrackingBusMarker",
    html: `
      <div class="cwBusMarker">
        <span>🚌</span>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });

const trackingUserIcon =
  new L.DivIcon({
    className:
      "cwTrackingUserMarker",
    html: `
      <div class="cwUserMarker">
        <span></span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

const TRACKING_STOPS = [
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

export default function LiveTracking() {
  const [busIndex, setBusIndex] =
    useState(3);

  const [speed, setSpeed] =
    useState(38);

  const [occupancy, setOccupancy] =
    useState(68);

  const [gpsActive, setGpsActive] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState({
      lat: 12.9249,
      lng: 80.1,
    });

  const [lastUpdate, setLastUpdate] =
    useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setBusIndex((previous) => {
        const next =
          (previous + 1) %
          TRACKING_STOPS.length;

        return next;
      });

      setSpeed(
        Math.floor(
          Math.random() * 12
        ) + 32
      );

      setOccupancy(
        Math.floor(
          Math.random() * 15
        ) + 60
      );

      setLastUpdate(new Date());
    }, 5000);

    return () =>
      clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watch =
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat:
              position.coords.latitude,
            lng:
              position.coords.longitude,
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

    return () =>
      navigator.geolocation.clearWatch(
        watch
      );
  }, []);

  const currentStop =
    TRACKING_STOPS[busIndex];

  const nextStop =
    TRACKING_STOPS[
      (busIndex + 1) %
        TRACKING_STOPS.length
    ];

  const routeCoordinates =
    TRACKING_STOPS.map(
      (stop) => [
        stop.lat,
        stop.lng,
      ]
    );

  const status =
    occupancy >= 85
      ? "Critical"
      : occupancy >= 70
      ? "High"
      : "Moderate";

  return (
    <div className="cwTrackingPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            LIVE NETWORK
          </span>

          <h1>
            Live Bus Tracking
          </h1>

          <p>
            Monitor active buses and
            real-time route movement.
          </p>
        </div>

        <div className="cwLiveConnection">
          <span></span>

          <div>
            <strong>
              {gpsActive
                ? "GPS CONNECTED"
                : "TRACKING ONLINE"}
            </strong>

            <small>
              Updated{" "}
              {lastUpdate.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              )}
            </small>
          </div>
        </div>
      </div>

      <div className="cwTrackingLayout">
        <section className="cwTrackingMapCard">
          <div className="cwTrackingMapHeader">
            <div>
              <span className="sectionEyebrow">
                ROUTE 21G
              </span>

              <h2>
                Tambaram → Broadway
              </h2>
            </div>

            <span className="cwLiveBadge">
              <span></span>
              LIVE
            </span>
          </div>

          <div className="cwTrackingMap">
            <MapContainer
              center={[
                13.01,
                80.19,
              ]}
              zoom={11}
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Polyline
                positions={
                  routeCoordinates
                }
                pathOptions={{
                  color:
                    "#1de783",
                  weight: 5,
                  opacity: 0.9,
                }}
              />

              {TRACKING_STOPS.map(
                (stop) => (
                  <Circle
                    key={stop.name}
                    center={[
                      stop.lat,
                      stop.lng,
                    ]}
                    radius={100}
                    pathOptions={{
                      color:
                        "#1de783",
                      fillColor:
                        "#1de783",
                      fillOpacity:
                        0.15,
                      weight: 1,
                    }}
                  />
                )
              )}

              <Marker
                position={[
                  currentStop.lat,
                  currentStop.lng,
                ]}
                icon={
                  trackingBusIcon
                }
              >
                <Popup>
                  <strong>
                    Route 21G
                  </strong>

                  <br />

                  Current stop:{" "}
                  {currentStop.name}

                  <br />

                  Speed: {speed} km/h
                </Popup>
              </Marker>

              <Marker
                position={[
                  userLocation.lat,
                  userLocation.lng,
                ]}
                icon={
                  trackingUserIcon
                }
              >
                <Popup>
                  <strong>
                    Your location
                  </strong>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className="cwTrackingMapFooter">
            <div>
              <span className="mapLegendBus"></span>
              Active bus
            </div>

            <div>
              <span className="mapLegendRoute"></span>
              Route
            </div>

            <div>
              <span className="mapLegendUser"></span>
              Your location
            </div>
          </div>
        </section>

        <aside className="cwTrackingInfo">
          <div className="cwTrackingBusHeader">
            <div className="cwTrackingBusNumber">
              21G
            </div>

            <div>
              <span className="cwTrackingActive">
                ACTIVE
              </span>

              <h2>
                Tambaram → Broadway
              </h2>
            </div>
          </div>

          <div className="cwTrackingMetrics">
            <div>
              <span>OCCUPANCY</span>
              <strong>
                {occupancy}%
              </strong>

              <div className="cwTrackingBar">
                <span
                  style={{
                    width: `${occupancy}%`,
                  }}
                ></span>
              </div>

              <small>
                {status} crowd
              </small>
            </div>

            <div>
              <span>VEHICLE SPEED</span>
              <strong>
                {speed}
                <small>
                  km/h
                </small>
              </strong>
            </div>
          </div>

          <div className="cwTrackingNext">
            <span className="sectionEyebrow">
              CURRENT LOCATION
            </span>

            <strong>
              {currentStop.name}
            </strong>

            <div className="cwTrackingLine">
              <span className="cwLineDot"></span>

              <div></div>

              <span className="cwLineArrow">
                ↓
              </span>
            </div>

            <span className="sectionEyebrow">
              NEXT STOP
            </span>

            <strong>
              {nextStop.name}
            </strong>
          </div>

          <div className="cwTrackingETA">
            <div>
              <span>
                ESTIMATED ARRIVAL
              </span>

              <strong>
                06 min
              </strong>
            </div>

            <span className="cwETAStatus">
              On schedule
            </span>
          </div>

          <div className="cwTrackingSystem">
            <div>
              <span className="cwSystemDot"></span>

              <div>
                <strong>
                  Tracking system
                </strong>

                <small>
                  GPS data synchronized
                </small>
              </div>
            </div>

            <span>
              ONLINE
            </span>
          </div>
        </aside>
      </div>

      <section className="cwStopsCard">
        <div className="cwStopsHeader">
          <div>
            <span className="sectionEyebrow">
              ROUTE PROGRESS
            </span>

            <h2>
              Journey Stops
            </h2>
          </div>

          <span>
            {busIndex + 1} /{" "}
            {TRACKING_STOPS.length}
          </span>
        </div>

        <div className="cwStopsTimeline">
          {TRACKING_STOPS.map(
            (stop, index) => {
              const passed =
                index < busIndex;

              const current =
                index === busIndex;

              return (
                <div
                  className={`cwStop ${
                    passed
                      ? "passed"
                      : ""
                  } ${
                    current
                      ? "current"
                      : ""
                  }`}
                  key={stop.name}
                >
                  <div className="cwStopIndicator">
                    <span></span>
                  </div>

                  <div>
                    <strong>
                      {stop.name}
                    </strong>

                    <small>
                      {current
                        ? "Current"
                        : passed
                        ? "Passed"
                        : "Upcoming"}
                    </small>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}