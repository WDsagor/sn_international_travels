import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Wallet, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import {
  useGetClientsQuery,
  useReceivePaymentMutation,
} from "../../redux/features/clients/clientApiSlice";
import { CustomDatePicker } from "../share/CustomDatePicker";
import { formatCurrency, getTodayDateString } from "../../utils/dateFormate";

// পেমেন্ট মেথড লিস্ট (অতিরিক্ত স্পেস সরিয়ে সঠিক আইডি দেওয়া হয়েছে)
const PAYMENT_METHODS = [
  { id: "CASH PAYMENT", label: "Cash" },
  { id: "BANK TRANSFER", label: "Bank Transfer" },
  { id: "BKASH PAYMENT", label: "bKash" },
  { id: "NAGAD", label: "Nagad" },
  { id: "CHEQUE", label: "Cheque" },
];

const ReceivePaymentModal = ({ isOpen, onClose }) => {
  const { data: clients = [], isLoading: isClientsLoading } =
    useGetClientsQuery(undefined, { skip: !isOpen });

  const [receivePayment, { isLoading: isSubmitting }] =
    useReceivePaymentMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      clientId: "",
      paymentDate: getTodayDateString(),
      amount: "",
      paymentMethod: "CASH PAYMENT",
      accountNo: "",
      referenceNo: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const selectedClientId = watch("clientId");
  const enteredAmount = watch("amount") || 0;
  const selectedPaymentMethod = watch("paymentMethod");

  const selectedClient = clients?.data?.find(
    (c) => String(c.id) === String(selectedClientId),
  );

  const currentDue =
    selectedClient?.dueAmount ?? selectedClient?.currentDue ?? 0;
  const remainingDue = currentDue - Number(enteredAmount);

  // ব্যাংক বা মোবাইল ব্যাংকিং সিলেক্ট করলে অ্যাকাউন্ট ইনপুট দেখাবে
  const showAccountField = [
    "BANK TRANSFER",
    "BKASH PAYMENT",
    "NAGAD",
    "CHEQUE",
  ].includes(selectedPaymentMethod);

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        amount: Number(data.amount),
      };

      await receivePayment(formattedData).unwrap();

      Swal.fire({
        icon: "success",
        title: "Payment Received!",
        text: `৳${formattedData.amount.toLocaleString()} received successfully from ${
          selectedClient?.fullName || selectedClient?.name || "client"
        }.`,
        timer: 2500,
        showConfirmButton: false,
      });

      reset();
      onClose();
    } catch (error) {
      console.error("Failed to receive payment:", error);

      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          error?.data?.message ||
          "Something went wrong while processing the payment. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Receive Payment
              </h2>
              <p className="text-xs text-gray-500">
                Log customer payment or advance collection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-y-auto p-6 space-y-4"
        >
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
              Select Client / Customer *
            </label>
            <select
              {...register("clientId", {
                required: "Please select a client",
              })}
              className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                errors.clientId
                  ? "border-red-500 bg-red-50/30"
                  : "border-gray-200"
              }`}
            >
              <option value="">
                {isClientsLoading
                  ? "Loading clients..."
                  : "-- Select Client --"}
              </option>
              {clients?.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.name} {c.company ? `(${c.company})` : ""}{" "}
                  {c.dueAmount !== undefined
                    ? `- Due: ${formatAmount(c.dueAmount)}`
                    : ""}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.clientId.message}
              </span>
            )}
          </div>

          {/* Date & Amount Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Controller
                control={control}
                name="paymentDate"
                rules={{ required: "Payment Date is required" }}
                render={({ field, fieldState }) => (
                  <CustomDatePicker
                    label="Payment Date *"
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Amount (৳) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 1, message: "Amount must be greater than 0" },
                })}
                className={`w-full text-sm font-semibold font-mono border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.amount
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                }`}
              />
              {errors.amount && (
                <span className="text-xs text-red-500 mt-1 block">
                  {errors.amount.message}
                </span>
              )}
            </div>
          </div>

          {/* Due Balance Calculation Box */}
          {selectedClient && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div>
                <span className="text-gray-500 block">
                  {currentDue < 0 ? "Current Advance:" : "Current Due:"}
                </span>
                <span
                  className={`font-mono font-bold ${
                    currentDue < 0 ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  {formatCurrency(Math.abs(currentDue))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">
                  {remainingDue < 0 ? "New Advance Balance:" : "Remaining Due:"}
                </span>
                <span
                  className={`font-mono font-bold ${
                    remainingDue <= 0 ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {formatCurrency(Math.abs(remainingDue))}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method, Account & Transaction Ref */}
          <div
            className={`grid grid-cols-1 ${
              showAccountField ? "sm:grid-cols-3" : "sm:grid-cols-2"
            } gap-4`}
          >
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Payment Method *
              </label>
              <select
                {...register("paymentMethod")}
                className="w-full text-sm border border-gray-200 px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Transaction ID / Ref
              </label>
              <input
                type="text"
                placeholder="e.g. Trx7890XX"
                {...register("referenceNo")}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>
          </div>

          {/* Remarks/Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
              Note / Remarks
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Payment for PNR98765 ticket"
              {...register("note")}
              className="w-full text-sm border border-gray-200 p-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivePaymentModal;
