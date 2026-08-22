import React, { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const value = Math.min(
        100,
        Math.round((elapsed / duration) * 100)
      );

      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);

        setTimeout(() => {
          onComplete?.();
        }, 150);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="cwSplash">
      <div className="cwSplashGrid"></div>

      <div className="cwSplashContent">
        <div className="cwSplashLogo">
          CW
        </div>

        <div className="cwSplashBrand">
          <h1>CrowdWise</h1>
          <span>AI TRANSPORT INTELLIGENCE</span>
        </div>

        <div className="cwSplashDivider"></div>

        <p className="cwSplashTagline">
          Smarter journeys. Better mobility.
        </p>

        <div className="cwSplashLoader">
          <div className="cwSplashLoaderTrack">
            <div
              className="cwSplashLoaderFill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="cwSplashLoaderInfo">
            <span>INITIALIZING SYSTEM</span>
            <strong>{progress}%</strong>
          </div>
        </div>

        <div className="cwSplashStatus">
          <span className="cwStatusDot"></span>
          Transport intelligence services ready
        </div>
      </div>

      <div className="cwSplashFooter">
        <span>CROWDWISE AI</span>
        <span>PUBLIC TRANSPORT INTELLIGENCE</span>
        <span>2026</span>
      </div>
    </div>
  );
}