import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-day-picker/dist/style.css";

export const CustomDatePicker = ({
  value,
  onChange,
  label,
  error,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xx font-semibold text-gray-600 uppercase mb-1">
          {label}
        </label>
      )}

      {/* অতি ক্ষুদ্র ইনপুট বক্স */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border px-2 py-2.5 rounded-xl flex items-center justify-between bg-white text-left focus:outline-none focus:ring-1 focus:ring-blue-500/20 cursor-pointer ${
          error ? "border-red-500 bg-red-50/30" : "border-gray-200"
        }`}
      >
        <span
          className={
            selectedDate
              ? "text-gray-900 font-mono text-xs"
              : "text-gray-400 text-xs"
          }
        >
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "DD/MM/YYYY"}
        </span>
        <CalendarIcon className="w-3 h-3 text-gray-400" />
      </button>

      {/* অতি ক্ষুদ্র ক্যালেন্ডার পপআপ */}
      {isOpen && (
        <div className="absolute z-50 m-0  bg-white border border-gray-100 rounded-lg shadow-md px-2 py-0 scale-75 origin-top-left ">
          <DayPicker
            mode="single"
            selected={selectedDate}
            disabled={minDate ? { before: new Date(minDate) } : undefined}
            onSelect={(date) => {
              if (date) {
                onChange(date.toISOString());
              }
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
