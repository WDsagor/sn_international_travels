import { X } from "lucide-react";
import React from "react";

const PassportModal = ({ isOpen, onClose, initialData = null }) => {
  const isEditMode = Boolean(initialData);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditMode ? "Update Passport Details" : "Add New Passport"}
            </h2>
            <p className="text-xs text-gray-500">
              Enter ticket details and financial logging
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                PNR Code *
              </label>
              <input
                type="text"
                placeholder="e.g. 123456"
                {...register("pnrCode", { required: "PNR is required" })}
                className={`w-full uppercase text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono ${
                  errors.pnrCode
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Ticket Type *
              </label>
              <select
                {...register("ticketType", { required: true })}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="one_way">One Way</option>
                <option value="round_trip">Round Trip</option>
                <option value="multi_city">Multi City</option>
              </select>
            </div>

            <div>
              <Controller
                control={control}
                name="issueDate"
                rules={{ required: "Issue Date is required" }}
                render={({ field, fieldState }) => (
                  <CustomDatePicker
                    label="Issue Date *"
                    value={field.value}
                    onChange={(date) => {
                      field.onChange(date);
                      const currentTravel = control._formValues.travelDate;
                      if (
                        currentTravel &&
                        new Date(currentTravel) < new Date(date)
                      ) {
                        setValue("travelDate", "");
                      }
                    }}
                    error={fieldState.error}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Primary Passenger Name *
              </label>
              <input
                type="text"
                placeholder="MD Rahamat ali"
                {...register("passengerName", {
                  required: "Passenger name is required",
                })}
                className={`w-full text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.passengerName
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Route (e.g. DAC{" "}
                {currentTicketType === "round_trip" ||
                currentTicketType === "multi_city"
                  ? "⇋"
                  : "⇒"}{" "}
                CXB) *
              </label>
              <input
                type="text"
                placeholder={
                  currentTicketType === "round_trip" ||
                  currentTicketType === "multi_city"
                    ? "GDG⇋FDG"
                    : "GGG⇒DDD"
                }
                {...register("route", {
                  required: "Route is required",
                  validate: (value) => {
                    if (currentTicketType === "multi_city") {
                      const isValid =
                        /^([A-Z]{3}⇋[A-Z]{3})(,\s*[A-Z]{3}⇋[A-Z]{3})*$/.test(
                          value,
                        );
                      return (
                        isValid ||
                        "Please enter valid complete pairs (e.g. DAB⇋DAC, DXB⇋MAA)"
                      );
                    }
                    return true;
                  },
                })}
                onChange={handleRouteInput}
                className={`w-full uppercase text-sm border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono ${
                  errors.route
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Controller
                control={control}
                name="travelDate"
                rules={{ required: "Travel Date is required" }}
                render={({ field, fieldState }) => (
                  <CustomDatePicker
                    label="Travel Date *"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error}
                    minDate={issueDate}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Total Pax Details
              </label>
              <input
                type="text"
                placeholder="3 Adult, 1 Child, 1 Infant"
                {...register("totalPax")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Issued By *
              </label>
              <select
                disabled={usersLoading}
                {...register("issuedById", {
                  required: "Please select value",
                })}
                className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.issuedById
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              >
                <option value="">
                  {usersLoading ? "Loading users..." : "Select value"}
                </option>

                {users.map((user) => (
                  <option
                    key={user?.id || user?._id}
                    value={user?.id || user?._id}
                  >
                    {user?.fullName || user?.name}{" "}
                    {user?.role ? `(${user?.role})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Client *
              </label>
              <select
                disabled={clientsLoading}
                {...register("clientId", {
                  required: "Please select a client",
                })}
                className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.clientId
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              >
                <option value="">
                  {clientsLoading ? "Loading clients..." : "Select client"}
                </option>

                {clients.map((client) => (
                  <option
                    key={client?.id || client?._id}
                    value={client?.id || client?._id}
                  >
                    {client?.fullName || client?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Airline *
              </label>
              <select
                {...register("airline", {
                  required: "Please select an airline",
                })}
                className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 truncate ${
                  errors.airline
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              >
                <option value="">Select Airline</option>
                {AIRLINE_LIST.map((a) => (
                  <option key={a.id} value={`${a.code} - ${a.name}`}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase"
              >
                <option value="issued">Issued</option>
                <option value="reissue">Reissue</option>
                <option value="refund">Refund</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>

          <div
            className={`p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 ${
              showServiceCharge ? "sm:grid-cols-4" : "sm:grid-cols-3"
            } gap-4 items-center`}
          >
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Net Cost (৳) *
              </label>
              <input
                type="number"
                {...register("netCost", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Client Price (৳) *
              </label>
              <input
                type="number"
                {...register("clientPrice", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="w-full text-sm font-semibold font-mono border border-gray-200 px-3 py-2 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {showServiceCharge && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-amber-600 uppercase mb-1">
                  Service Charge (৳)
                </label>
                <input
                  type="number"
                  {...register("serviceCharge", { valueAsNumber: true })}
                  placeholder="0"
                  className="w-full text-sm font-semibold font-mono border border-amber-300 bg-amber-50 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}

            <div>
              <span className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Net Profit (Auto)
              </span>
              <div
                className={`text-base font-bold font-mono px-3 py-2 rounded-xl border ${
                  calculatedProfit >= 0
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                ৳{calculatedProfit.toLocaleString()}
              </div>
            </div>
          </div>

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
              disabled={isSubmitting || (isEditMode && !isDirty)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors  ${
                isSubmitting || (isEditMode && !isDirty)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed flex items-center gap-2"
                  : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              }`}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update Ticket"
                  : "Create Ticket"}
            </button>
          </div>
        </form> */}
      </div>
    </div>
  );
};

export default PassportModal;
