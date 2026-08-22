import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      if (supabase) {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (authError) {
          throw authError;
        }

        if (data?.user) {
          const user = {
            id: data.user.id,
            email: data.user.email,
            name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "CrowdWise User",
            phone:
              data.user.user_metadata?.phone || "",
            role: "Student",
          };

          onLogin(user);
          navigate("/");
          return;
        }
      }

      const storedUser =
        localStorage.getItem("crowdwise_user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        if (
          user.email?.toLowerCase() ===
          email.trim().toLowerCase()
        ) {
          onLogin(user);
          navigate("/");
          return;
        }
      }

      throw new Error(
        "Unable to sign in. Please check your credentials."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cwAuthPage">
      <div className="cwAuthBackground">
        <div className="cwAuthGlow glowOne"></div>
        <div className="cwAuthGlow glowTwo"></div>
        <div className="cwAuthGrid"></div>
      </div>

      <div className="cwAuthShell">
        <div className="cwAuthBrandPanel">
          <div className="cwAuthBrand">
            <div className="cwAuthLogo">CW</div>

            <div>
              <h2>CrowdWise</h2>
              <span>AI TRANSPORT</span>
            </div>
          </div>

          <div className="cwAuthBrandMain">
            <span className="cwAuthEyebrow">
              INTELLIGENT MOBILITY PLATFORM
            </span>

            <h1>
              Understand the crowd.
              <br />
              <span>Move smarter.</span>
            </h1>

            <p>
              CrowdWise combines live transport
              intelligence and AI-powered crowd
              prediction to make everyday travel
              more informed.
            </p>

            <div className="cwAuthFeatureList">
              <div>
                <span>01</span>
                <div>
                  <strong>Live tracking</strong>
                  <small>
                    Monitor active buses in real time.
                  </small>
                </div>
              </div>

              <div>
                <span>02</span>
                <div>
                  <strong>AI prediction</strong>
                  <small>
                    Predict crowd levels before you travel.
                  </small>
                </div>
              </div>

              <div>
                <span>03</span>
                <div>
                  <strong>Smart travel history</strong>
                  <small>
                    Keep your journeys organized.
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="cwAuthPanelFooter">
            <span>CHENNAI TRANSPORT NETWORK</span>
            <span>● SYSTEM ONLINE</span>
          </div>
        </div>

        <div className="cwAuthFormPanel">
          <div className="cwMobileBrand">
            <div className="cwAuthLogo">CW</div>
            <div>
              <strong>CrowdWise</strong>
              <small>AI TRANSPORT</small>
            </div>
          </div>

          <div className="cwAuthFormHeader">
            <span className="cwAuthEyebrow">
              ACCOUNT ACCESS
            </span>

            <h1>Welcome back</h1>

            <p>
              Sign in to continue to your
              transport intelligence dashboard.
            </p>
          </div>

          {error && (
            <div className="cwFormMessage error">
              <span>!</span>
              {error}
            </div>
          )}

          {success && (
            <div className="cwFormMessage success">
              <span>✓</span>
              {success}
            </div>
          )}

          <form
            className="cwAuthForm"
            onSubmit={handleSubmit}
          >
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="cwPasswordButton"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label="Toggle password"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <div className="cwFormOptions">
              <label className="cwRemember">
                <input type="checkbox" />
                <span></span>
                Remember me
              </label>

              <button
                type="button"
                className="cwForgotButton"
                onClick={() =>
                  setSuccess(
                    "Password reset is available through your registered email."
                  )
                }
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="cwPrimaryAuthButton"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="cwButtonSpinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="cwAuthDivider">
            <span>NEW TO CROWDWISE?</span>
          </div>

          <Link
            to="/signup"
            className="cwSecondaryAuthButton"
          >
            Create an account
          </Link>

          <div className="cwSecurityNote">
            <span>◆</span>
            Your account is protected with
            secure authentication.
          </div>
        </div>
      </div>
    </div>
  );
}