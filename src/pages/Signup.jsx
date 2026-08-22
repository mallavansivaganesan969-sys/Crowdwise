import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Signup({ onSignup }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     SIGNUP
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    /* VALIDATION */

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    if (cleanName.length < 2) {
      setError(
        "Please enter a valid full name."
      );
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         SUPABASE REGISTRATION
      ===================================================== */

      if (supabase) {
        const {
          data,
          error: authError,
        } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,

          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
              role: "Student",
            },
          },
        });

        if (authError) {
          throw authError;
        }

        /* USER CREATED */

        if (data?.user) {
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            name: cleanName,
            phone: cleanPhone,
            role: "Student",
          };

          /*
           * Supabase may require email confirmation.
           */

          if (
            data.user.identities &&
            data.user.identities.length === 0
          ) {
            throw new Error(
              "An account with this email may already exist."
            );
          }

          /*
           * If a session exists, the user is immediately logged in.
           */

          if (data.session) {
            onSignup(newUser);

            localStorage.setItem(
              "crowdwise_user",
              JSON.stringify(newUser)
            );

            navigate("/");
            return;
          }

          /*
           * Email confirmation enabled.
           */

          setSuccess(
            "Account created successfully! Please check your email to verify your account."
          );

          setName("");
          setPhone("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");

          return;
        }
      }

      /* =====================================================
         LOCAL FALLBACK
         Used only if Supabase is unavailable.
      ===================================================== */

      const localUser = {
        id:
          "local-" +
          Date.now(),
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        role: "Student",
      };

      localStorage.setItem(
        "crowdwise_user",
        JSON.stringify(localUser)
      );

      onSignup(localUser);

      navigate("/");
    } catch (err) {
      console.error(
        "Signup error:",
        err
      );

      let message =
        err?.message ||
        "Unable to create your account. Please try again.";

      /*
       * Friendlier Supabase messages
       */

      if (
        message
          .toLowerCase()
          .includes("user already registered")
      ) {
        message =
          "This email is already registered. Please sign in instead.";
      }

      if (
        message
          .toLowerCase()
          .includes("password should be at least")
      ) {
        message =
          "Password must contain at least 6 characters.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cwAuthPage">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="cwAuthBackground">

        <div className="cwAuthGlow glowOne"></div>

        <div className="cwAuthGlow glowTwo"></div>

        <div className="cwAuthGrid"></div>

      </div>

      {/* =====================================================
          AUTH SHELL
      ===================================================== */}

      <div className="cwAuthShell">

        {/* ===================================================
            LEFT BRAND PANEL
        =================================================== */}

        <div className="cwAuthBrandPanel">

          <div className="cwAuthBrand">

            <div className="cwAuthLogo">
              CW
            </div>

            <div>
              <h2>
                CrowdWise
              </h2>

              <span>
                AI TRANSPORT
              </span>
            </div>

          </div>

          <div className="cwAuthBrandMain">

            <span className="cwAuthEyebrow">
              INTELLIGENT MOBILITY PLATFORM
            </span>

            <h1>
              Join the future.
              <br />

              <span>
                Travel smarter.
              </span>
            </h1>

            <p>
              Create your CrowdWise account
              and access real-time transport
              intelligence, AI crowd prediction,
              and smart travel tools.
            </p>

            {/* FEATURES */}

            <div className="cwAuthFeatureList">

              <div>

                <span>
                  01
                </span>

                <div>

                  <strong>
                    Live tracking
                  </strong>

                  <small>
                    Monitor active buses in real time.
                  </small>

                </div>

              </div>

              <div>

                <span>
                  02
                </span>

                <div>

                  <strong>
                    AI prediction
                  </strong>

                  <small>
                    Predict crowd levels before you travel.
                  </small>

                </div>

              </div>

              <div>

                <span>
                  03
                </span>

                <div>

                  <strong>
                    Smart travel history
                  </strong>

                  <small>
                    Keep your journeys organized.
                  </small>

                </div>

              </div>

            </div>

          </div>

          <div className="cwAuthPanelFooter">

            <span>
              CHENNAI TRANSPORT NETWORK
            </span>

            <span>
              ● SYSTEM ONLINE
            </span>

          </div>

        </div>

        {/* ===================================================
            RIGHT FORM PANEL
        =================================================== */}

        <div className="cwAuthFormPanel">

          {/* MOBILE BRAND */}

          <div className="cwMobileBrand">

            <div className="cwAuthLogo">
              CW
            </div>

            <div>

              <strong>
                CrowdWise
              </strong>

              <small>
                AI TRANSPORT
              </small>

            </div>

          </div>

          {/* HEADER */}

          <div className="cwAuthFormHeader">

            <span className="cwAuthEyebrow">
              NEW ACCOUNT
            </span>

            <h1>
              Create your account
            </h1>

            <p>
              Join CrowdWise and start
              making smarter travel decisions.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="cwFormMessage error">

              <span>
                !
              </span>

              {error}

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="cwFormMessage success">

              <span>
                ✓
              </span>

              {success}

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="cwAuthForm"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <label>

              Full name

              <div className="cwInputWrapper">

                <span className="cwInputIcon">
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                />

              </div>

            </label>

            {/* PHONE */}

            <label>

              Phone number

              <div className="cwInputWrapper">

                <span className="cwInputIcon">
                  ☎
                </span>

                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  autoComplete="tel"
                  maxLength={10}
                />

              </div>

            </label>

            {/* EMAIL */}

            <label>

              Email address

              <div className="cwInputWrapper">

                <span className="cwInputIcon">
                  @
                </span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </label>

            {/* PASSWORD */}

            <label>

              Password

              <div className="cwInputWrapper">

                <span className="cwInputIcon">
                  •
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="cwPasswordButton"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </label>

            {/* CONFIRM PASSWORD */}

            <label>

              Confirm password

              <div className="cwInputWrapper">

                <span className="cwInputIcon">
                  •
                </span>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="cwPasswordButton"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </label>

            {/* TERMS */}

            <label className="cwRemember">

              <input
                type="checkbox"
                required
              />

              <span></span>

              I agree to use CrowdWise responsibly.

            </label>

            {/* SUBMIT */}

            <button
              type="submit"
              className="cwPrimaryAuthButton"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="cwButtonSpinner"></span>

                  Creating account...
                </>
              ) : (
                <>
                  Create account

                  <span>
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <div className="cwAuthDivider">

            <span>
              ALREADY HAVE AN ACCOUNT?
            </span>

          </div>

          <Link
            to="/login"
            className="cwSecondaryAuthButton"
          >
            Sign in to CrowdWise
          </Link>

          {/* SECURITY */}

          <div className="cwSecurityNote">

            <span>
              ◆
            </span>

            Your account is protected with
            secure authentication.

          </div>

        </div>

      </div>

    </div>
  );
}