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
import { Search } from "lucide-react";
import { VENDOR_LIST } from "../components/modals/TicketModal";
import { Link } from "react-router-dom";
import { LucideUsers } from "lucide-react";
import { UsersRound } from "lucide-react";
import ClientModal from "../components/modals/ClientModal";
import { Download } from "lucide-react";
import { useGetClientsQuery } from "../redux/api/clientApi";

const Clients = () => {
  const { data: clients = [], isLoading, isError } = useGetClientsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
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
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Add New Client
          </button>
        </div>
      </div>
      <div className="bg-white flex justify-between items-center gap-5 p-3 rounded-xl border border-gray-200 shadow-sm  mb-6">
        <div className="w-full max-w-md">
          {isLoading ? (
            <p className="text-center text-sm font-medium text-gray-500">
              Loading clients...
            </p>
          ) : isError ? (
            <p className=" text-center text-sm font-semibold text-red-500">
              Failed to load data!
            </p>
          ) : (
            <select className="w-full text-sm border border-blue-300 px-3 py-2.5 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ">
              <option value="">Select client list</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.fullName}>
                  {client.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
        <button className="text-sm flex gap-2 items-center border border-blue-200  bg-blue-50 py-1.5 px-5 rounded-xl font-sans cursor-pointer hover:bg-blue-100 transition-colors  text-blue-700">
          {" "}
          <Download size={20} />
          Report
        </button>
      </div>
      <div className="min-h-screen w-full bg-gray-50 font-sans grid grid-cols-1  gap-6">
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
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedClient={selectedClient}
      />
    </div>
  );
};

export default Clients;
