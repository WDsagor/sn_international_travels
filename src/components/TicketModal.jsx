import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

// ভেন্ডর তালিকা
const VENDOR_LIST = [
  { id: "v1", name: "Mostofa Kamal" },
  { id: "v2", name: "Fly Deals Travel" },
  { id: "v3", name: "B2B Cargo & Ticketing" },
  { id: "v4", name: "SkyLink Aviation" },
];

// এয়ারলাইন কোড ও নামসহ তালিকা
const AIRLINE_LIST = [
  { id: "bg", code: "BG", name: "Biman Bangladesh Airlines" },
  { id: "bs", code: "BS", name: "US-Bangla Airlines" },
  { id: "vq", code: "VQ", name: "Novoair" },
  { id: "qr", code: "QR", name: "Qatar Airways" },
  { id: "ek", code: "EK", name: "Emirates" },
  { id: "ey", code: "EY", name: "Etihad Airways" },
  { id: "g9", code: "G9", name: "Air Arabia" },
  { id: "fz", code: "FZ", name: "Flydubai" },
  { id: "sv", code: "SV", name: "Saudia" },
  { id: "ku", code: "KU", name: "Kuwait Airways" },
  { id: "gf", code: "GF", name: "Gulf Air" },
  { id: "wy", code: "WY", name: "Oman Air" },
  { id: "mh", code: "MH", name: "Malaysia Airlines" },
  { id: "ak", code: "AK", name: "AirAsia" },
  { id: "sq", code: "SQ", name: "Singapore Airlines" },
  { id: "tg", code: "TG", name: "Thai Airways" },
  { id: "cx", code: "CX", name: "Cathay Pacific" },
  { id: "ai", code: "AI", name: "Air India" },
  { id: "uk", code: "UK", name: "Vistara" },
  { id: "6e", code: "6E", name: "IndiGo" },
];

const TicketModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pnr: "",
      ticketNo: "",
      issueDate: new Date().toISOString().split("T")[0],
      passengerName: "",
      route: "",
      travelDate: "",
      totalPax: 1,
      baggage: "23KG",
      vendor: "",
      airline: "", // ড্রপডাউন থেকে সিলেক্ট হবে
      vendorCost: 0,
      grossPrice: 0,
      status: "issued",
    },
  });

  const vendorCost = watch("vendorCost") || 0;
  const grossPrice = watch("grossPrice") || 0;
  const calculatedProfit = grossPrice - vendorCost;

  const onSubmit = (data) => {
    const finalData = { ...data, profit: calculatedProfit };
    onSubmitSuccess(finalData);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Issue New Ticket
            </h2>
            <p className="text-xs text-gray-500">
              Enter ticket details and vendor financial logging
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-5"
        >
          {/* Section 1: Ticket & PNR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                PNR Code *
              </label>
              <input
                type="text"
                placeholder="e.g. PNR98765"
                {...register("pnr", { required: "PNR is required" })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono ${errors.pnr ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Ticket Number
              </label>
              <input
                type="text"
                placeholder="e.g. BG-5542190"
                {...register("ticketNo")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Issue Date *
              </label>
              <input
                type="date"
                {...register("issueDate", { required: true })}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Section 2: Passenger & Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Primary Passenger Name *
              </label>
              <input
                type="text"
                placeholder="Rahim Ali"
                {...register("passengerName", {
                  required: "Passenger name is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${errors.passengerName ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Route (e.g. DAC ➔ JFK) *
              </label>
              <input
                type="text"
                placeholder="DAC - JFK"
                {...register("route", { required: "Route is required" })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${errors.route ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
              />
            </div>
          </div>

          {/* Section 3: More Passenger Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Travel Date *
              </label>
              <input
                type="date"
                {...register("travelDate", {
                  required: "Travel date is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${errors.travelDate ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Total Pax Details
              </label>
              <input
                type="text"
                placeholder="3 Persons (2 Adult, 1 Child)"
                {...register("totalPax")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Baggage Allow
              </label>
              <input
                type="text"
                placeholder="2PC x 23KG"
                {...register("baggage")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Section 4: Dropdowns & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vendor Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Vendor *
              </label>
              <select
                {...register("vendor", { required: "Please select a vendor" })}
                className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${errors.vendor ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
              >
                <option value="">Select Vendor</option>
                {VENDOR_LIST.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Airline *
              </label>
              <div className="relative w-full">
                <select
                  {...register("airline", {
                    required: "Please select an airline",
                  })}
                  className={`w-full max-h-52 overflow-y-auto text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 pr-8 truncate ${
                    errors.airline
                      ? "border-red-500 bg-red-50/30"
                      : "border-gray-200"
                  }`}
                  style={{ maxWidth: "100%" }}
                >
                  <option value="">Select Airline</option>
                  {AIRLINE_LIST.map((a) => (
                    <option key={a.id} value={`${a.code} - ${a.name}`}>
                      {a.code} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="issued">Issued</option>
                <option value="reissue">Reissue</option>
                <option value="cancel">Cancel</option>
              </select>
            </div>
          </div>

          {/* Section 5: Financials & Auto Profit */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Vendor Cost (৳) *
              </label>
              <input
                type="number"
                {...register("vendorCost", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Gross Price (৳) *
              </label>
              <input
                type="number"
                {...register("grossPrice", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Net Profit (Auto)
              </span>
              <div
                className={`text-base font-bold font-mono px-3 py-2 rounded-xl border ${calculatedProfit >= 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                ৳{calculatedProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
            >
              Confirm & Log Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
