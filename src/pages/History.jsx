import React, {
  useMemo,
  useState,
} from "react";

const initialTrips = [
  {
    id: 1,
    route: "21G",
    from: "Tambaram",
    to: "Broadway",
    date: "22 Aug 2026",
    time: "08:12 AM",
    duration: "52 min",
    occupancy: 68,
    status: "Completed",
  },
  {
    id: 2,
    route: "70",
    from: "Guindy",
    to: "T Nagar",
    date: "21 Aug 2026",
    time: "05:42 PM",
    duration: "26 min",
    occupancy: 48,
    status: "Completed",
  },
  {
    id: 3,
    route: "102",
    from: "Tambaram",
    to: "Broadway",
    date: "20 Aug 2026",
    time: "08:04 AM",
    duration: "61 min",
    occupancy: 82,
    status: "Completed",
  },
  {
    id: 4,
    route: "60A",
    from: "Tambaram",
    to: "Guindy",
    date: "19 Aug 2026",
    time: "07:58 AM",
    duration: "42 min",
    occupancy: 76,
    status: "Completed",
  },
  {
    id: 5,
    route: "5E",
    from: "Saidapet",
    to: "Broadway",
    date: "18 Aug 2026",
    time: "06:34 PM",
    duration: "31 min",
    occupancy: 91,
    status: "Completed",
  },
];

function crowdStatus(value) {
  if (value >= 85) return "Critical";
  if (value >= 70) return "High";
  if (value >= 50) return "Moderate";
  return "Low";
}

export default function History() {
  const [trips, setTrips] =
    useState(initialTrips);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        `${trip.route} ${trip.from} ${trip.to}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =
        filter === "All" ||
        crowdStatus(
          trip.occupancy
        ) === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [trips, search, filter]);

  const totalTrips = trips.length;

  const averageOccupancy =
    trips.length
      ? Math.round(
          trips.reduce(
            (sum, trip) =>
              sum + trip.occupancy,
            0
          ) / trips.length
        )
      : 0;

  const clearHistory = () => {
    if (
      window.confirm(
        "Clear your travel history?"
      )
    ) {
      setTrips([]);
    }
  };

  return (
    <div className="cwHistoryPage">
      <div className="pageTopHeader">
        <div>
          <span className="sectionEyebrow">
            PERSONAL TRANSPORT DATA
          </span>

          <h1>
            Travel History
          </h1>

          <p>
            Review your previous
            CrowdWise journeys and
            crowd conditions.
          </p>
        </div>

        {trips.length > 0 && (
          <button
            className="cwHistoryClearButton"
            onClick={clearHistory}
          >
            Clear History
          </button>
        )}
      </div>

      <div className="cwHistoryStats">
        <div>
          <span>TOTAL JOURNEYS</span>
          <strong>
            {totalTrips}
          </strong>
          <small>
            Tracked journeys
          </small>
        </div>

        <div>
          <span>AVG OCCUPANCY</span>
          <strong>
            {averageOccupancy}%
          </strong>
          <small>
            Across your trips
          </small>
        </div>

        <div>
          <span>ROUTES USED</span>
          <strong>
            {new Set(
              trips.map(
                (trip) =>
                  trip.route
              )
            ).size}
          </strong>
          <small>
            Different routes
          </small>
        </div>

        <div>
          <span>LAST TRIP</span>
          <strong>
            {trips[0]?.route ||
              "—"}
          </strong>
          <small>
            Most recent route
          </small>
        </div>
      </div>

      <section className="cwHistoryCard">
        <div className="cwHistoryToolbar">
          <div className="cwHistorySearch">
            <span>⌕</span>

            <input
              placeholder="Search route or destination..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="cwHistoryFilters">
            {[
              "All",
              "Low",
              "Moderate",
              "High",
              "Critical",
            ].map((item) => (
              <button
                key={item}
                className={
                  filter === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(item)
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="cwHistoryEmpty">
            <div>◌</div>

            <h2>
              No journeys found
            </h2>

            <p>
              Your matching travel
              history will appear here.
            </p>
          </div>
        ) : (
          <div className="cwHistoryTable">
            <div className="cwHistoryTableHeader">
              <span>ROUTE</span>
              <span>JOURNEY</span>
              <span>DATE & TIME</span>
              <span>DURATION</span>
              <span>OCCUPANCY</span>
              <span>STATUS</span>
            </div>

            {filteredTrips.map(
              (trip) => (
                <div
                  className="cwHistoryRow"
                  key={trip.id}
                >
                  <div className="cwHistoryRoute">
                    <strong>
                      {trip.route}
                    </strong>

                    <small>
                      Bus route
                    </small>
                  </div>

                  <div className="cwHistoryJourney">
                    <strong>
                      {trip.from}
                    </strong>

                    <span>→</span>

                    <strong>
                      {trip.to}
                    </strong>
                  </div>

                  <div className="cwHistoryDate">
                    <strong>
                      {trip.date}
                    </strong>

                    <small>
                      {trip.time}
                    </small>
                  </div>

                  <div className="cwHistoryDuration">
                    {trip.duration}
                  </div>

                  <div className="cwHistoryOccupancy">
                    <strong>
                      {trip.occupancy}%
                    </strong>

                    <div>
                      <span
                        className={crowdStatus(
                          trip.occupancy
                        ).toLowerCase()}
                        style={{
                          width: `${trip.occupancy}%`,
                        }}
                      ></span>
                    </div>

                    <small>
                      {crowdStatus(
                        trip.occupancy
                      )}
                    </small>
                  </div>

                  <div>
                    <span className="cwCompletedBadge">
                      ✓ Completed
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <div className="cwHistoryPrivacy">
        <span>◆</span>

        <div>
          <strong>
            Your travel data is private
          </strong>

          <p>
            CrowdWise stores journey
            information securely and
            only displays it to your
            authenticated account.
          </p>
        </div>
      </div>
    </div>
  );
}