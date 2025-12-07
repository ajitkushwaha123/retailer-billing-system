import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-white gap-6">
      {/* Logo */}
      <div className="animate-pulse">
        <img
          src="/assets/logo.jpg"
          className="w-20 h-20 rounded-xl shadow-lg"
          alt="logo"
        />
      </div>

      {/* Loader Bar */}
      <div className="w-44 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-full bg-black animate-[loader_1.8s_ease-in-out_infinite]" />
      </div>

      {/* Text */}
      <p className="text-sm tracking-wide text-gray-600 animate-fade">
        Loading, please wait...
      </p>

      <style jsx>{`
        @keyframes loader {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
