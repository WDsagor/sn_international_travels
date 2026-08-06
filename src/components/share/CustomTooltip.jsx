import React from "react";

const colorVariants = {
  blue: {
    bg: "bg-blue-600",
    arrow: "border-t-blue-600",
  },
  red: {
    bg: "bg-red-600",
    arrow: "border-t-red-600",
  },
  gray: {
    bg: "bg-gray-600",
    arrow: "border-t-gray-600",
  },
  green: {
    bg: "bg-green-600",
    arrow: "border-t-green-600",
  },
};

const CustomTooltip = ({ color = "gray", text }) => {
  const selectedColor = colorVariants[color] || colorVariants.gray;

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
      <span
        className={`${selectedColor.bg} text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-lg whitespace-nowrap`}
      >
        {text}
      </span>
      <div
        className={`w-0 h-0 border-x-4 border-x-transparent border-t-4 ${selectedColor.arrow}`}
      />
    </div>
  );
};

export default CustomTooltip;
