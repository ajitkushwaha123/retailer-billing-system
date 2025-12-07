import React from "react";

const EmptyState = ({ title = "No Products Found", actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center select-none">
      <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full shadow-sm mb-6 animate-scale">
        <span className="text-3xl">📦</span>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>

      <p className="text-gray-500 w-[70%] sm:w-[40%] text-sm leading-relaxed">
        You're all set, but no products are added yet. Add products to get
        started.
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 text-white bg-black rounded-lg mt-6 hover:bg-gray-900 transition font-medium"
        >
          {actionLabel}
        </button>
      )}

      <style jsx>{`
        @keyframes scaleUp {
          0% {
            transform: scale(0.85);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale {
          animation: scaleUp 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default EmptyState;
