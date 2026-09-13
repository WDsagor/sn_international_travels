import React, { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Ticket,
  Plane,
  FileText,
  TrendingUp,
  CalendarDays,
  Wallet,
  ShieldCheck,
  ArrowUpDown,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const UserById = ({ userId }) => {
  const [data, setData] = useState({
    success: true,
    filter: {
      month: null,
      startDate: null,
      endDate: null,
    },
    user: {
      id: "6c5b5429-053c-4a65-8206-aacccd1645a2",
      fullName: "Nil Ratan Dhali",
      phone: "01712345678",
      email: "dhali@gmail.com",
      role: "Admin",
      status: "active",
      joiningDate: "2026-07-25T00:00:00.000Z",
      monthlySalary: 35000,
      address: "House 12, Road 5, Dhanmondi, Dhaka",
      createdAt: "2026-09-11T15:23:06.969Z",
      tickets: [
        {
          id: "0213fa3b-5d9d-482c-9141-cbb5f150f27d",
          pnrCode: "ASHJR",
          ticketType: "round_trip",
          issueDate: "2026-09-04T00:00:00.000Z",
          passengerName: "Rahman Khan",
          route: "DAC⇋DXB",
          travelDate: "2026-09-24T00:00:00.000Z",
          totalPax: "1 Adult",
          airlineCode: "TK",
          status: "reissue",
          netCost: 45000,
          clientPrice: 46000,
          serviceCharge: 1000,
          netProfit: 2000,
          issuedById: "6c5b5429-053c-4a65-8206-aacccd1645a2",
          clientId: "35173411-badf-44e9-b024-2a0dfe794204",
          createdAt: "2026-09-11T20:33:15.380Z",
          updatedAt: "2026-09-11T20:35:13.935Z",
        },
      ],
      visa: [
        {
          id: "b59f027f-18b2-4b96-a599-09426bb14ae1",
          issueDate: "2026-09-12T20:13:38.347Z",
          clientId: "859e02f1-78d1-47ad-ba02-9714a17dcb5e",
          issuedById: "6c5b5429-053c-4a65-8206-aacccd1645a2",
          passportName: "Omar Faysal",
          passportNumber: "A13836276",
          numberOfPassport: 1,
          passportImage: "https://i.ibb.co/HLqNL6qc/Passport.jpg",
          visaCategory: "agency",
          visaType: "M Jahir",
          agencyName: "M Jahir",
          submissionDate: "2026-09-12T20:13:38.347Z",
          visaCountry: "CHINA",
          visaDetails: "2YM",
          status: "Submitted",
          netCost: 14500,
          clientPrice: 16500,
          netProfit: 2000,
          createdAt: "2026-09-12T20:14:34.283Z",
          updatedAt: "2026-09-13T08:20:19.196Z",
        },
      ],
      monthlyTicketCount: 1,
      monthlyVisaCount: 1,
      monthlyTicketProfit: 2000,
      monthlyVisaProfit: 2000,
      monthlyProfit: 4000,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterType, setFilterType] = useState("current");
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [ticketSearch, setTicketSearch] = useState("");
  const [visaSearch, setVisaSearch] = useState("");

  const [ticketSort, setTicketSort] = useState({
    field: "createdAt",
    direction: "desc",
  });

  const [visaSort, setVisaSort] = useState({
    field: "createdAt",
    direction: "desc",
  });

  // =========================
  // Fetch User
  // =========================

  // const fetchUser = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     let url = `/api/users/${userId}`;

  //     const params = new URLSearchParams();

  //     if (filterType === "month" && month) {
  //       params.append("month", month);
  //     }

  //     if (filterType === "range") {
  //       if (startDate) params.append("startDate", startDate);
  //       if (endDate) params.append("endDate", endDate);
  //     }

  //     const query = params.toString();

  //     if (query) {
  //       url += `?${query}`;
  //     }

  //     const res = await fetch(url);

  //     if (!res.ok) {
  //       throw new Error("Failed to load user data");
  //     }

  //     const result = await res.json();

  //     if (!result?.user) {
  //       throw new Error("User not found");
  //     }

  //     setData(result);
  //   } catch (err) {
  //     console.error(err);
  //     setError(err.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // =========================
  // Filter Apply
  // =========================

  const handleFilter = () => {
    if (filterType === "month" && !month) {
      return;
    }

    if (filterType === "range" && (!startDate || !endDate)) {
      return;
    }

    // fetchUser();
  };

  // =========================
  // Reset Filter
  // =========================

  const resetFilter = () => {
    setFilterType("current");
    setMonth("");
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      // fetchUser();
    }, 0);
  };

  // =========================
  // Sort Helper
  // =========================

  const sortData = (data, sortConfig) => {
    return [...data].sort((a, b) => {
      let valueA = a?.[sortConfig.field];
      let valueB = b?.[sortConfig.field];

      if (sortConfig.field === "netProfit") {
        valueA = Number(valueA) || 0;
        valueB = Number(valueB) || 0;
      }

      if (
        sortConfig.field === "createdAt" ||
        sortConfig.field === "issueDate" ||
        sortConfig.field === "travelDate"
      ) {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      }

      valueA = String(valueA ?? "").toLowerCase();
      valueB = String(valueB ?? "").toLowerCase();

      if (typeof valueA === "string" && typeof valueB === "string") {
        const result = valueA.localeCompare(valueB, undefined, {
          numeric: true,
          sensitivity: "base",
        });

        return sortConfig.direction === "asc" ? result : -result;
      }

      return 0;
    });
  };

  const toggleSort = (type, field) => {
    if (type === "ticket") {
      setTicketSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    }

    if (type === "visa") {
      setVisaSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    }
  };

  // =========================
  // Data
  // =========================

  const user = data?.user;

  const tickets = useMemo(() => {
    if (!user?.tickets) return [];

    const filtered = user.tickets.filter((ticket) => {
      const search = ticketSearch.toLowerCase();

      return (
        ticket.pnrCode?.toLowerCase().includes(search) ||
        ticket.route?.toLowerCase().includes(search) ||
        ticket.passengerName?.toLowerCase().includes(search)
      );
    });

    return sortData(filtered, ticketSort);
  }, [user?.tickets, ticketSearch, ticketSort]);

  const visas = useMemo(() => {
    if (!user?.visa) return [];

    const filtered = user.visa.filter((visa) => {
      const search = visaSearch.toLowerCase();

      return (
        visa.passportNumber?.toLowerCase().includes(search) ||
        visa.passportName?.toLowerCase().includes(search) ||
        visa.visaCountry?.toLowerCase().includes(search) ||
        visa.visaType?.toLowerCase().includes(search)
      );
    });

    return sortData(filtered, visaSort);
  }, [user?.visa, visaSearch, visaSort]);

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="flex  items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-xs text-slate-500">Loading user data...</p>
        </div>
      </div>
    );
  }

  // =========================
  // Error
  // =========================

  if (error || !user) {
    return (
      <div className="flex  items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <h2 className="text-base font-semibold text-slate-900">
            Unable to load user
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {error || "User not found"}
          </p>

          <button
            onClick={fetchUser}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalServices =
    Number(user.monthlyTicketCount || 0) + Number(user.monthlyVisaCount || 0);

  return (
    <div className="min-h-screen bg-slate-50 p-3 text-sm md:p-5 lg:p-6">
      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
            User Performance
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">
            Track tickets, visas and profit performance
          </p>
        </div>

        {/* Filter */}
        <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border bg-white p-2 shadow-sm lg:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-blue-500"
          >
            <option value="current">Current Month</option>
            <option value="month">Select Month</option>
            <option value="range">Date Range</option>
          </select>

          {filterType === "month" && (
            <>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
              />

              <button
                onClick={handleFilter}
                className="h-9 rounded-lg bg-blue-600 px-3.5 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                Apply
              </button>
            </>
          )}

          {filterType === "range" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-500"
              />

              <button
                onClick={handleFilter}
                className="h-9 rounded-lg bg-blue-600 px-3.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </>
          )}

          {(filterType !== "current" || month || startDate || endDate) && (
            <button
              onClick={resetFilter}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* =========================
          USER PROFILE
      ========================= */}

      <div className="mb-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="bg-linear-to-r from-slate-900 to-blue-900 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold text-white ring-1 ring-white/30 md:h-20 md:w-20 md:text-2xl">
              {user.fullName
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white md:text-2xl">
                  {user.fullName}
                </h2>

                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-medium capitalize text-emerald-300">
                  {user.status}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-blue-200">{user.role}</p>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Phone size={13} />
                  {user.phone}
                </span>

                <span className="flex items-center gap-1.5">
                  <Mail size={13} />
                  {user.email}
                </span>

                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {user.address}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-3 text-left md:min-w-40 md:text-center">
              <p className="text-[10px] text-blue-200">Monthly Salary</p>

              <p className="mt-0.5 text-lg font-bold text-white">
                ৳{Number(user.monthlySalary || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          KPI CARDS
      ========================= */}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Ticket size={17} />}
          title="Tickets"
          value={user.monthlyTicketCount}
          subtitle="Issued"
        />

        <StatCard
          icon={<FileText size={17} />}
          title="Visas"
          value={user.monthlyVisaCount}
          subtitle="Processed"
        />

        <StatCard
          icon={<Plane size={17} />}
          title="Ticket Profit"
          value={`৳${Number(user.monthlyTicketProfit || 0).toLocaleString()}`}
          subtitle="Net profit"
        />

        <StatCard
          icon={<ShieldCheck size={17} />}
          title="Visa Profit"
          value={`৳${Number(user.monthlyVisaProfit || 0).toLocaleString()}`}
          subtitle="Net profit"
        />

        <div className="col-span-2 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-sm md:col-span-1">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-white/15 p-2">
              <TrendingUp size={17} />
            </div>

            <span className="text-[10px] text-blue-100">TOTAL</span>
          </div>

          <p className="mt-3 text-xs text-blue-100">Total Profit</p>

          <h3 className="mt-0.5 text-xl font-bold">
            ৳{Number(user.monthlyProfit || 0).toLocaleString()}
          </h3>
        </div>
      </div>

      {/* =========================
          PROFIT SUMMARY
      ========================= */}

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profit */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Profit Overview
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Selected period performance
              </p>
            </div>

            <Wallet size={19} className="text-blue-600" />
          </div>

          <div className="space-y-5">
            <ProfitBar
              title="Ticket Profit"
              value={user.monthlyTicketProfit}
              total={user.monthlyProfit}
            />

            <ProfitBar
              title="Visa Profit"
              value={user.monthlyVisaProfit}
              total={user.monthlyProfit}
            />
          </div>
        </div>

        {/* Report */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <CalendarDays size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Report Period
              </h3>

              <p className="text-[11px] text-slate-500">Current selection</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-[11px] text-slate-500">Filter</p>

            <p className="mt-1 text-xs font-semibold text-slate-900">
              {data.filter?.month
                ? data.filter.month
                : data.filter?.startDate
                  ? `${data.filter.startDate} → ${data.filter.endDate}`
                  : "Current Month"}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-slate-500">Total Services</p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {totalServices}
              </p>
            </div>

            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-slate-500">Total Profit</p>

              <p className="mt-1 text-lg font-bold text-blue-600">
                ৳{Number(user.monthlyProfit || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          TABLES
      ========================= */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* =========================
            TICKETS
        ========================= */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Tickets
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {tickets.length} ticket found
                </p>
              </div>

              <Ticket size={19} className="text-blue-600" />
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                placeholder="Search PNR, route, passenger..."
                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>
                  <SortHeader
                    title="PNR"
                    field="pnrCode"
                    sort={ticketSort}
                    onClick={() => toggleSort("ticket", "pnrCode")}
                  />

                  <SortHeader
                    title="Route"
                    field="route"
                    sort={ticketSort}
                    onClick={() => toggleSort("ticket", "route")}
                  />

                  <SortHeader
                    title="Passenger"
                    field="passengerName"
                    sort={ticketSort}
                    onClick={() => toggleSort("ticket", "passengerName")}
                  />

                  <SortHeader
                    title="Profit"
                    field="netProfit"
                    sort={ticketSort}
                    onClick={() => toggleSort("ticket", "netProfit")}
                  />

                  <SortHeader
                    title="Date"
                    field="createdAt"
                    sort={ticketSort}
                    onClick={() => toggleSort("ticket", "createdAt")}
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        {ticket.pnrCode}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {ticket.route}
                      </td>

                      <td className="max-w-40 truncate px-4 py-3 font-medium text-slate-700">
                        {ticket.passengerName}
                      </td>

                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        ৳{Number(ticket.netProfit || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message="No tickets found" />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================
            VISA
        ========================= */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Visas
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {visas.length} visa found
                </p>
              </div>

              <FileText size={19} className="text-indigo-600" />
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={visaSearch}
                onChange={(e) => setVisaSearch(e.target.value)}
                placeholder="Search passport, country, type..."
                className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>
                  <SortHeader
                    title="Passport"
                    field="passportNumber"
                    sort={visaSort}
                    onClick={() => toggleSort("visa", "passportNumber")}
                  />

                  <SortHeader
                    title="Country"
                    field="visaCountry"
                    sort={visaSort}
                    onClick={() => toggleSort("visa", "visaCountry")}
                  />

                  <SortHeader
                    title="Type"
                    field="visaType"
                    sort={visaSort}
                    onClick={() => toggleSort("visa", "visaType")}
                  />

                  <SortHeader
                    title="Profit"
                    field="netProfit"
                    sort={visaSort}
                    onClick={() => toggleSort("visa", "netProfit")}
                  />

                  <SortHeader
                    title="Date"
                    field="createdAt"
                    sort={visaSort}
                    onClick={() => toggleSort("visa", "createdAt")}
                  />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visas.length > 0 ? (
                  visas.map((visa) => (
                    <tr key={visa.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {visa.passportNumber}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-600">
                          {visa.visaCountry}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {visa.visaType}
                      </td>

                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        ৳{Number(visa.netProfit || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatDate(visa.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message="No visas found" />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Stat Card
========================= */

const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>

        <span className="text-[10px] text-slate-400">{subtitle}</span>
      </div>

      <p className="mt-3 text-xs text-slate-500">{title}</p>

      <h3 className="mt-0.5 text-xl font-bold text-slate-900">{value}</h3>
    </div>
  );
};

/* =========================
   Profit Bar
========================= */

const ProfitBar = ({ title, value, total }) => {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;

  const percentage =
    numericTotal > 0 ? Math.min((numericValue / numericTotal) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-medium text-slate-700">{title}</span>

        <span className="font-semibold text-slate-900">
          ৳{numericValue.toLocaleString()}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-right text-[10px] text-slate-400">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
};

/* =========================
   Sort Header
========================= */

const SortHeader = ({ title, field, sort, onClick }) => {
  const active = sort.field === field;

  return (
    <th
      onClick={onClick}
      className="cursor-pointer whitespace-nowrap px-4 py-3 transition hover:bg-slate-100"
    >
      <div className="flex items-center gap-1">
        <span>{title}</span>

        {active ? (
          sort.direction === "asc" ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ArrowUpDown size={11} className="text-slate-300" />
        )}
      </div>
    </th>
  );
};

/* =========================
   Empty Row
========================= */

const EmptyRow = ({ colSpan, message }) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-xs text-slate-400"
      >
        {message}
      </td>
    </tr>
  );
};

/* =========================
   Date Format
========================= */

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default UserById;
