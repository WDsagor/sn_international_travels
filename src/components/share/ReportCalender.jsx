import React, { useState } from "react";
import { AlertCircle, Download, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css"; // Default styles

const ReportCalender = ({ onGenerateReport }) => {
  // ১. ডেট রেঞ্জ ও পপওভার স্টেট
  const [range, setRange] = useState({ from: undefined, to: undefined });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReportReady, setIsReportReady] = useState(false);

  const isFormValid = range?.from && range?.to;

  // ২. জেনারেট ও ডাউনলোড হ্যান্ডলার
  const handleReportAction = async () => {
    if (isReportReady) {
      if (onGenerateReport) {
        onGenerateReport({
          clientId: selectedClientId,
          startDate: format(range.from, "yyyy-MM-dd"),
          endDate: format(range.to, "yyyy-MM-dd"),
        });
      }
      return;
    }

    setIsGenerating(true);
    try {
      if (onGenerateReport) {
        await onGenerateReport({
          // clientId: selectedClientId,
          startDate: format(range.from, "yyyy-MM-dd"),
          endDate: format(range.to, "yyyy-MM-dd"),
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      setIsReportReady(true);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClientChange = (e) => {
    setIsReportReady(false);
    // handleClientSelect(e);
  };

  const handleRangeSelect = (selectedRange) => {
    setIsReportReady(false);
    setRange(selectedRange || { from: undefined, to: undefined });
    if (selectedRange?.from && selectedRange?.to) {
      setIsPickerOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
      {/* 🟢 React Day Picker Popup Range Input */}
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="w-full text-xx font-medium border border-gray-300 px-3.5 py-2.5 rounded-xl text-gray-700 bg-white flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span>
              {range?.from
                ? range.to
                  ? `${format(range.from, "MMM dd, yyyy")} - ${format(range.to, "MMM dd, yyyy")}`
                  : `${format(range.from, "MMM dd, yyyy")} - Select end`
                : "Select Date Range"}
            </span>
          </div>
        </button>

        {/* DayPicker Dropdown Box */}
        {isPickerOpen && (
          <div className="absolute right-0 top-12 z-50 bg-white p-3 rounded-2xl shadow-xl border border-gray-100">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={1}
              required
              resetOnSelect
              disabled={{ after: new Date() }}
            />
          </div>
        )}
      </div>

      {/* 🟢 Dynamic Action Button */}
      <button
        disabled={!isFormValid || isGenerating}
        onClick={handleReportAction}
        className={`text-xx flex shrink-0 items-center justify-center gap-2 py-2.5 px-5 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isReportReady
            ? "bg-green-600 hover:bg-green-700 text-white shadow-xs"
            : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating...
          </>
        ) : isReportReady ? (
          <>
            <Download size={18} />
            Download Report
          </>
        ) : (
          <>
            <Calendar size={18} />
            {isFormValid ? "Generate Report" : "Select Date Range"}
          </>
        )}
      </button>
    </div>
  );
};

export default ReportCalender;
