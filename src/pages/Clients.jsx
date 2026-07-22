import React from "react";

import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import AddClientModal from "../components/modals/AddClientModal";
const Clients = () => {
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleAddClient = (data) => {
    console.log("New Client Data:", data);
  };
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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

      <div className="min-h-screen w-full bg-gray-50 font-sans grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Client List & Info */}

        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Client Accounts
            </h2>
            <div className="space-y-3">
              {/* Active Client Card */}
              <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/30 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">Universal Travels</h3>
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
                  <span className="text-xs text-gray-400">
                    Net Outstanding:
                  </span>
                  <span className="text-sm font-mono font-bold text-red-600">
                    ৳45,000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Financial Ledger Log */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Universal Travels
              </h2>
              <p className="text-xs text-gray-400">Client EMAIL ADDRESS</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                <FileText className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </div>

          {/* Ledger Table (Double-Entry Log) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Reference / Details</th>
                  <th className="px-4 py-3 text-right">Debit (Owed)</th>
                  <th className="px-4 py-3 text-right">Credit (Paid)</th>
                  <th className="px-4 py-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                <tr>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    20-Jul-2026
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-900">
                      Ticket Purchase (PNR98765)
                    </div>
                    <div className="text-xs text-gray-400">
                      Pax: Rahim Ali - Destination: JFK
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-red-600 font-medium">
                    ৳85,000
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gray-400">
                    -
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-gray-900">
                    ৳85,000
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    20-Jul-2026
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-900">
                      Bank Payment Received
                    </div>
                    <div className="text-xs text-gray-400">
                      City Bank - Ref: #TXN44120
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-gray-400">
                    -
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-green-600 font-medium">
                    ৳40,000
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-red-600">
                    ৳45,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
