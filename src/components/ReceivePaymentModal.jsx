import React from "react";
import { useForm } from "react-hook-form";
import { X, Wallet } from "lucide-react";

// ক্লায়েন্ট লিস্ট (উদাহরণস্বরূপ)
const CLIENT_LIST = [
  { id: "c1", name: "Rahim Ali", dueAmount: 15000 },
  { id: "c2", name: "Karim Uddin", dueAmount: 45000 },
  { id: "c3", name: "Sky Travels Ltd", dueAmount: 85000 },
];

// পেমেন্ট মেথড লিস্ট
const PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank Transfer" },
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "cheque", label: "Cheque" },
];

const ReceivePaymentModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      clientName: "",
      paymentDate: new Date().toISOString().split("T")[0],
      amount: "",
      paymentMethod: "cash",
      accountNo: "",
      referenceNo: "",
      note: "",
    },
  });

  const selectedClientName = watch("clientName");
  const enteredAmount = watch("amount") || 0;

  // সিলেক্ট করা ক্লায়েন্টের বর্তমান ডিউ খুঁজে বের করা
  const selectedClient = CLIENT_LIST.find((c) => c.name === selectedClientName);
  const currentDue = selectedClient ? selectedClient.dueAmount : 0;
  const remainingDue = currentDue - Number(enteredAmount);

  const onSubmit = (data) => {
    onSubmitSuccess(data);
    reset();
    onClose();
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
            onClick={() => onClose(false)}
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
              {...register("clientName", {
                required: "Please select a client",
              })}
              className={`w-full text-sm border px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${errors.clientName ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
            >
              <option value="">Select Client</option>
              {CLIENT_LIST.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} (Due: ৳{c.dueAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Payment Date *
              </label>
              <input
                type="date"
                {...register("paymentDate", { required: true })}
                className="w-full text-sm border border-gray-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">
                Amount (৳) *
              </label>
              <input
                type="number"
                placeholder="0.00"
                {...register("amount", {
                  required: "Amount is required",
                  min: 1,
                })}
                className={`w-full text-sm font-semibold font-mono border px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${errors.amount ? "border-red-500 bg-red-50/30" : "border-gray-200"}`}
              />
            </div>
          </div>

          {/* Due Balance Calculation Box */}
          {selectedClient && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 block">Current Due:</span>
                <span className="font-mono font-bold text-gray-800">
                  ৳{currentDue.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block">Remaining Due:</span>
                <span
                  className={`font-mono font-bold ${remainingDue <= 0 ? "text-green-600" : "text-amber-600"}`}
                >
                  ৳{remainingDue.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              onClick={() => onClose(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceivePaymentModal;
