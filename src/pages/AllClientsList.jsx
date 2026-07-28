import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

import {
  useDeleteClientMutation,
  useGetClientsQuery,
} from "../redux/api/clientApi";
import Swal from "sweetalert2";
import ClientModal from "../components/modals/ClientModal";
import { User } from "lucide-react";
import { Phone } from "lucide-react";
import { Mail } from "lucide-react";
import { CircleChevronRight } from "lucide-react";
import { Eye } from "lucide-react";

const AllClientList = () => {
  const { data: clients = [], isLoading, isError } = useGetClientsQuery();
  const [deleteClient] = useDeleteClientMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Search filter
  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.clientType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Delete Handler with SweetAlert
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteClient(id).unwrap();
          Swal.fire("Deleted!", "Client has been deleted.", "success");
        } catch (error) {
          Swal.fire(
            "Error!",
            error?.data?.message || "Failed to delete.",
            "error",
          );
        }
      }
    });
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients & Agents</h1>
          <p className="text-xs text-gray-500">
            Manage your individual clients, corporate clients, and B2B agents
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-6 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Name, Phone or Type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <div className="min-h-screen bg-gray-50/50 font-sans">
        {isLoading ? (
          <div className="p-12 text-center text-sm font-medium text-gray-500">
            Loading clients...
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-sm font-semibold text-red-500">
            Failed to load data!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredClients?.length === 0 ? (
              <div className="col-span-full py-12 text-center font-medium text-gray-500">
                No clients found!
              </div>
            ) : (
              filteredClients?.map((client) => {
                // নেগেটিভ ব্যালেন্স থাকলে Due, পজিটিভ থাকলে Balance
                const isDue = (client.openingBalance || 0) < 0;

                return (
                  <div
                    key={client.id}
                    className="   cursor-pointer group rounded-2xl border border-blue-100/80 shadow-md relative overflow-hidden p-3 flex flex-col justify-between"
                  >
                    {/* Top-Right Decorative Curve Accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-t from-blue-100  to-indigo-400 rounded-bl-full pointer-events-none" />

                    <div className="p-2 max-w-md  group-hover:scale-103 transition-all ">
                      {/* Header Section: Avatar, Full Name & Main Email */}
                      <div className="flex items-center gap-3.5 mb-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-base leading-tight truncate">
                            {client.fullName}
                          </h3>
                          {client.email && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {client.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Company / Type & Dynamic Status Badge */}
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {client.company || client.clientType || "Individual"}
                        </h4>

                        {/* Dynamic Status Tag (Due vs Balance) */}
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                            isDue
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isDue ? "Due" : "Balance"}
                        </span>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{client.phone}</span>
                        </p>
                        {client.email && (
                          <p className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Divider Line */}
                      <div className="border-t border-gray-200/60 pt-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">
                          {isDue ? "Net Outstanding:" : "Available Balance:"}
                        </span>
                        <span
                          className={`text-base font-bold ${
                            isDue ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          ৳
                          {Math.abs(
                            client.openingBalance || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Icons */}
                    <div className="flex  justify-between items-center">
                      <button className="px-10 cursor-pointer flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors border border-gray-200">
                        <Eye className="w-4 h-4" size={20} strokeWidth={1.5} />{" "}
                        Details
                      </button>

                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(client)}
                          className="px-5 cursor-pointer flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-medium transition-colors border border-gray-200"
                          title="Edit Client"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="px-5 cursor-pointer flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors border border-gray-200"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal Import */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedClient={selectedClient}
      />
    </div>
  );
};

export default AllClientList;
