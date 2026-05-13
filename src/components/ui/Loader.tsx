// components/Loader.jsx - Enhanced with theme support
import React from "react";

const Loader = ({
  color = "var(--color-accent)",
  shadowColor = "rgba(0,0,0,0.2)",
}) => {
  return (
    <div className="relative z-10 w-50 h-15">
      {/* Circles */}
      <div
        className="absolute w-5 h-5 rounded-full left-[15%] origin-center animate-[circle7124_0.5s_alternate_infinite_ease]"
        style={{
          transformOrigin: "50%",
          backgroundColor: color,
        }}
      />
      <div
        className="absolute w-5 h-5 rounded-full left-[45%] origin-center animate-[circle7124_0.5s_alternate_infinite_ease]"
        style={{
          transformOrigin: "50%",
          animationDelay: "0.2s",
          backgroundColor: color,
        }}
      />
      <div
        className="absolute w-5 h-5 rounded-full right-[15%] origin-center animate-[circle7124_0.5s_alternate_infinite_ease]"
        style={{
          transformOrigin: "50%",
          animationDelay: "0.3s",
          backgroundColor: color,
        }}
      />

      {/* Shadows */}
      <div
        className="absolute w-5 h-1 rounded-full top-15.5 left-[15%] -z-10 blur-[1px] origin-center animate-[shadow046_0.5s_alternate_infinite_ease]"
        style={{
          transformOrigin: "50%",
          backgroundColor: shadowColor,
        }}
      />
      <div
        className="absolute w-5 h-1 rounded-full top-15.5 left-[45%] -z-10 blur-[1px] origin-center animate-[shadow046_0.5s_alternate_infinite_ease]"
        style={{
          transformOrigin: "50%",
          animationDelay: "0.2s",
          backgroundColor: shadowColor,
        }}
      />
      <div
        className="absolute w-5 h-1 rounded-full top-15.5 right-[15%] -z-10 blur-[1px] origin-center animate-[shadow046_0.5s_alternate_infinite_ease]"
        style={{
          transformOrigin: "50%",
          animationDelay: "0.3s",
          backgroundColor: shadowColor,
        }}
      />
    </div>
  );
};

export default Loader;
