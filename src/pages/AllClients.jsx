import { UserPlus } from "lucide-react";
import React from "react";
import AddClientModal from "../components/modals/AddClientModal";
import { useState } from "react";
import { VENDOR_LIST } from "../components/modals/TicketModal";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { Mail } from "lucide-react";
import { User } from "lucide-react";

const AllClients = () => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleAddClient = (data) => {
    console.log("New Client Data:", data);
  };
  return (
    <div className="min-h-screen p-4 bg-gray-50 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Client Accounts Ledger
          </h1>
          <p className="text-sm text-gray-500">
            Real-time financial status and ticketing hub
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsClientModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add New Client
          </button>
        </div>
        <AddClientModal
          isOpen={isClientModalOpen}
          onClose={setIsClientModalOpen}
          onSubmitSuccess={handleAddClient}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {VENDOR_LIST.map((v) => (
          <div className=" rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-t from-blue-100  to-indigo-400 rounded-bl-full pointer-events-none" />
            <div className="p-4 max-w-md rounded-xl border-2 border-blue-500/10 hover:scale-103 transition-all bg-blue-50/30 cursor-pointer">
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200">
                  <User />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{v.name}</h3>
                  <p className="text-xs text-gray-400">zahid@agency.com</p>
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900"></h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                  Due
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 01711223344
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3" /> info@universal.com
                </p>
              </div>
              <div className="border-t border-gray-200/60 pt-2 flex justify-between">
                <span className="text-xs text-gray-400">Net Outstanding:</span>
                <span className="text-sm font-mono font-bold text-red-600">
                  ৳45,000
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllClients;
