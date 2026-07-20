import React, { useState } from "react";
import {
  Ticket,
  Users,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
} from "lucide-react";
import TicketModal from "../components/TicketModal";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const handleTicketSubmit = (formData) => {
    console.log("New Ticket Created Data:", formData);
    // এখানে আপনার API কল বা টেবিলে নতুন ডেটা পুশ করার লজিক লিখতে পারেন
  };
  // Mock Data
  const [metrics] = useState({
    totalInvoiced: 1250000,
    totalPaid: 950000,
    currentBalance: 300000,
    totalProfit: 150000,
  });

  const [recentTickets] = useState([
    {
      id: 1,
      pnr: "PNR98765",
      passenger: "Rahim Ali",
      destination: "JFK",
      status: "issued",
      amount: 85000,
    },
    {
      id: 2,
      pnr: "PNR43210",
      passenger: "Karim Uddin",
      destination: "LHR",
      status: "reissue",
      amount: 120000,
    },
    {
      id: 3,
      pnr: "PNR11223",
      passenger: "Mst. Asma",
      destination: "DXB",
      status: "cancel",
      amount: 45000,
    },
  ]);

  return (
    // Tailwind v4-এ w-full এবং flex-1 এর রেণ্ডারিং আরও ফাস্ট করার জন্য লেআউট অপ্টিমাইজ করা হয়েছে
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Travel Agency Ledger & Ticketing
          </h1>
          <p className="text-sm text-gray-500">
            Real-time financial status and ticketing hub
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" /> Issue Ticket
          </button>
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Receive Payment
          </button>
        </div>
        <TicketModal
          isOpen={showModal}
          onClose={setShowModal}
          onSubmitSuccess={handleTicketSubmit}
        />
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Invoiced */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Total Invoiced
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 font-mono">
            ৳{metrics.totalInvoiced.toLocaleString()}
          </h3>
          <p className="text-xs text-blue-600 flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" /> Total generated bills
          </p>
        </div>

        {/* Card 2: Total Paid */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Total Collection
            </span>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 font-mono">
            ৳{metrics.totalPaid.toLocaleString()}
          </h3>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
            <ArrowDownLeft className="w-3 h-3" /> Cash & Bank received
          </p>
        </div>

        {/* Card 3: Outstanding Balance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Market Due (Receivables)
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 font-mono">
            ৳{metrics.currentBalance.toLocaleString()}
          </h3>
          <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
            <RefreshCw className="w-3 h-3" /> Remaining client balance
          </p>
        </div>

        {/* Card 4: Profit */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Net Profit
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 font-mono">
            ৳{metrics.totalProfit.toLocaleString()}
          </h3>
          <p className="text-xs text-indigo-600 flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" /> (Gross - Vendor Cost)
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Recent Transactions
            </h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3.5">PNR</th>
                  <th className="pb-3.5">Passenger</th>
                  <th className="pb-3.5">Dest.</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-3.5 font-mono font-bold text-gray-900">
                      {ticket.pnr}
                    </td>
                    <td className="py-3.5 font-medium text-gray-800">
                      {ticket.passenger}
                    </td>
                    <td className="py-3.5 font-semibold text-gray-500">
                      {ticket.destination}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                        ${ticket.status === "issued" ? "bg-green-50/60 text-green-700 border-green-200" : ""}
                        ${ticket.status === "reissue" ? "bg-blue-50/60 text-blue-700 border-blue-200" : ""}
                        ${ticket.status === "cancel" ? "bg-red-50/60 text-red-700 border-red-200" : ""}
                      `}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-mono font-semibold text-gray-900">
                      ৳{ticket.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Tools / Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-5">
            Quick Shortcuts
          </h2>
          <div className="space-y-3">
            <div className="p-3.5 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50/80 cursor-pointer transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    Client Ledger Log
                  </h4>
                  <p className="text-xs text-gray-400">Statement breakdown</p>
                </div>
              </div>
            </div>
            <div className="p-3.5 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-50/80 cursor-pointer transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">
                    Process Refund / Void
                  </h4>
                  <p className="text-xs text-gray-400">
                    Calculate charge rules
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
