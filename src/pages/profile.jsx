import React, { useState } from "react";

export default function Profile({ user, onLogout }) {
  const savedUser =
    user ||
    JSON.parse(localStorage.getItem("crowdwise_user") || "null");

  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: savedUser?.name || "CrowdWise Student",
    email: savedUser?.email || "student@crowdwise.ai",
    phone: savedUser?.phone || "",
    college: savedUser?.college || "AMET University",
    course: savedUser?.course || "Artificial Intelligence & Data Science",
    role: savedUser?.role || "Student",
  });

  const handleChange = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveProfile = () => {
    const updatedUser = {
      ...savedUser,
      ...profile,
    };

    localStorage.setItem(
      "crowdwise_user",
      JSON.stringify(updatedUser)
    );

    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("crowdwise_user");

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="profilePage">
      <div className="profileHero">
        <div className="profileAvatar">
          {profile.name
            ? profile.name.charAt(0).toUpperCase()
            : "C"}
        </div>

        <div className="profileHeroText">
          <span className="profileBadge">CROWDWISE USER</span>

          <h1>{profile.name}</h1>

          <p>{profile.email}</p>

          <div className="profileStatus">
            <span></span>
            Active account
          </div>
        </div>

        <button
          className="profileEditButton"
          onClick={() => setEditing(!editing)}
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="profileGrid">
        <section className="profileCard">
          <div className="profileCardHeader">
            <div>
              <span className="sectionEyebrow">PERSONAL</span>
              <h2>Personal Information</h2>
            </div>

            <span className="profileCardIcon">👤</span>
          </div>

          <div className="profileFields">
            <div className="profileField">
              <label>Full Name</label>

              {editing ? (
                <input
                  value={profile.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                />
              ) : (
                <strong>{profile.name}</strong>
              )}
            </div>

            <div className="profileField">
              <label>Email</label>

              <strong>{profile.email}</strong>
            </div>

            <div className="profileField">
              <label>Phone</label>

              {editing ? (
                <input
                  value={profile.phone}
                  onChange={(e) =>
                    handleChange("phone", e.target.value)
                  }
                />
              ) : (
                <strong>
                  {profile.phone || "Not provided"}
                </strong>
              )}
            </div>
          </div>
        </section>

        <section className="profileCard">
          <div className="profileCardHeader">
            <div>
              <span className="sectionEyebrow">EDUCATION</span>
              <h2>Student Information</h2>
            </div>

            <span className="profileCardIcon">🎓</span>
          </div>

          <div className="profileFields">
            <div className="profileField">
              <label>College</label>

              {editing ? (
                <input
                  value={profile.college}
                  onChange={(e) =>
                    handleChange("college", e.target.value)
                  }
                />
              ) : (
                <strong>{profile.college}</strong>
              )}
            </div>

            <div className="profileField">
              <label>Course</label>

              {editing ? (
                <input
                  value={profile.course}
                  onChange={(e) =>
                    handleChange("course", e.target.value)
                  }
                />
              ) : (
                <strong>{profile.course}</strong>
              )}
            </div>

            <div className="profileField">
              <label>Account Type</label>
              <strong>{profile.role}</strong>
            </div>
          </div>
        </section>

        <section className="profileCard profileStatsCard">
          <div className="profileCardHeader">
            <div>
              <span className="sectionEyebrow">ACTIVITY</span>
              <h2>Travel Statistics</h2>
            </div>

            <span className="profileCardIcon">📊</span>
          </div>

          <div className="profileStats">
            <div>
              <strong>24</strong>
              <span>Trips</span>
            </div>

            <div>
              <strong>186</strong>
              <span>KM Travelled</span>
            </div>

            <div>
              <strong>92%</strong>
              <span>Prediction Accuracy</span>
            </div>
          </div>
        </section>

        {editing && (
          <section className="profileSaveSection">
            <button
              className="profileSaveButton"
              onClick={saveProfile}
            >
              ✓ Save Changes
            </button>
          </section>
        )}

        <section className="profileDangerCard">
          <div>
            <span className="sectionEyebrow">ACCOUNT</span>
            <h2>Sign out</h2>
            <p>
              Sign out of your CrowdWise account on this device.
            </p>
          </div>

          <button
            className="profileLogoutButton"
            onClick={handleLogout}
          >
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}