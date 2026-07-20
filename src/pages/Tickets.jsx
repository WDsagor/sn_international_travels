import React, { useState } from "react";
import { Plus, Search, SlidersHorizontal, ArrowLeftRight } from "lucide-react";
import TicketModal from "../components/TicketModal";

const Tickets = () => {
  const [showModal, setShowModal] = useState(false);
  const handleTicketSubmit = (formData) => {
    console.log("New Ticket Created Data:", formData);
    // এখানে আপনার API কল বা টেবিলে নতুন ডেটা পুশ করার লজিক লিখতে পারেন
  };
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ticket Management
          </h1>
          <p className="text-sm text-gray-500">
            Issue, track, and manage all passenger flights
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Ticket Issue
        </button>
        <TicketModal
          isOpen={showModal}
          onClose={setShowModal}
          onSubmitSuccess={handleTicketSubmit}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search PNR, Ticket No, or Passenger..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none w-full md:w-auto">
            <option>All Status</option>
            <option>Issued</option>
            <option>Reissue</option>
            <option>Cancel</option>
            <option>Refunded</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                {/* কলামের নাম পরিবর্তন করে প্রাসঙ্গিক করা হয়েছে */}
                <th className="px-6 py-4">PNR & Issue Date</th>
                <th className="px-6 py-4">Travel Details</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Airline</th>
                <th className="px-6 py-4 text-right">Vendor Cost</th>
                <th className="px-6 py-4 text-right">Gross Price</th>
                <th className="px-6 py-4 text-right">Profit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              <tr className="hover:bg-gray-50/70 transition-colors">
                {/* PNR, Ticket No এবং Issue Date */}
                <td className="px-6 py-4">
                  <div className="font-mono font-bold text-gray-900">
                    PNR98765
                  </div>

                  {/* Issue Date এখানে যুক্ত করা হয়েছে */}
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    20 Jul 2026
                  </div>
                </td>

                {/* Passenger, Route এবং Travel/Fly Date */}
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">Rahim Ali</div>

                  {/* --- TOOLTIP WRAPPER --- */}
                  {/* group এবং relative ক্লাস দুটি এখানে মূল ভূমিকা পালন করছে */}
                  <div className="relative group w-max mt-0.5">
                    {/* রুট টেক্সট (যার ওপর হোভার করা হবে) */}
                    <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 cursor-pointer hover:text-blue-800 transition-colors">
                      DAC ➔ JFK
                    </div>

                    {/* --- ACTUAL TOOLTIP CARD --- */}
                    {/* ডিফল্টভাবে এটি hidden থাকে, group-hover:block বা group-hover:opacity-100 দিয়ে এটি হোভারে দৃশ্যমান হয় */}
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      {/* টুলটিপের ভেতরের কনটেন্ট */}
                      <p className="font-bold text-blue-400 border-b border-gray-700 pb-1 mb-1.5 uppercase tracking-wide">
                        Passenger Details
                      </p>
                      <div className="space-y-1 text-gray-300">
                        <p>
                          <span className="text-gray-400">Primary:</span> Rahim
                          Ali
                        </p>
                        <p>
                          <span className="text-gray-400">Total Pax:</span> 3
                          Persons (2 Adult, 1 Child)
                        </p>
                        <p>
                          <span className="text-gray-400">Baggage:</span> 2PC x
                          23KG
                        </p>
                      </div>

                      {/* টুলটিপের নিচের ছোট্ট তীর চিহ্ন (Arrow) */}
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>

                  {/* Fly/Travel Date */}
                  <div className="text-[11px] text-amber-600 font-medium mt-1.5 bg-amber-50 px-1.5 py-0.5 rounded w-max">
                    Fly: 15 Aug 2026
                  </div>
                </td>

                <td className="px-6 py-4 font-medium">Mostofa Kamal</td>
                <td className="px-6 py-4 font-medium">Biman Bangladesh</td>

                <td className="px-6 py-4 text-right font-mono text-gray-500">
                  ৳78,000
                </td>

                <td className="px-6 py-4 text-right font-mono font-semibold text-gray-900">
                  ৳85,000
                </td>

                <td className="px-6 py-4 text-right font-mono font-semibold text-green-600">
                  ৳7,000
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    Issued
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                    Change Status
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
