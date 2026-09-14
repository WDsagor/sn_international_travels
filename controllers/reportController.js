import prisma from "../prisma/prisma.js";

export const clientLedgerReports = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let start = null;
    let end = null;

    const hasDateFilter = Boolean(startDate || endDate);

    // =========================
    // DATE FILTER VALIDATION
    // =========================
    if (hasDateFilter) {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Both startDate and endDate are required",
        });
      }

      // YYYY-MM-DD validation
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      // Bangladesh timezone (+06:00)
      start = new Date(`${startDate}T00:00:00+06:00`);
      end = new Date(`${endDate}T23:59:59.999+06:00`);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "startDate cannot be greater than endDate",
        });
      }
    }

    // =========================
    // GET CLIENT
    // =========================
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found!",
      });
    }

    // =========================
    // SORT PAYMENTS
    // =========================
    const sortedPayments = [...client.payments].sort((a, b) => {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // =========================
    // OPENING BALANCE
    // =========================
    const openingBalance = Number(client.openingBalance || 0);

    // =========================
    // VARIABLES
    // =========================
    let beforeBalance = openingBalance;

    let totalDebit = 0;
    let totalCredit = 0;

    // Selected range-এর balance
    let ledgerBalance = openingBalance;

    // Selected range-এর পরের net transaction
    let afterBalance = 0;

    // Final/current outstanding
    let totalOutstandingDue = openingBalance;

    const ledger = [];

    // =====================================================
    // NO DATE FILTER
    // =====================================================
    // if (!hasDateFilter) {
    //   let runningBalance = openingBalance;

    //   for (const payment of sortedPayments) {
    //     const amount = Number(payment.amount || 0);
    //     const type = (payment.type || "").toLowerCase();

    //     const debit = type === "debit" ? amount : 0;
    //     const credit = type === "credit" ? amount : 0;

    //     runningBalance = runningBalance + debit - credit;

    //     totalDebit += debit;
    //     totalCredit += credit;

    //     ledger.push({
    //       id: payment.id,
    //       date: payment.paymentDate,
    //       createdAt: payment.createdAt,
    //       details: payment.paymentMethod,
    //       subDetails: payment.note,
    //       type: payment.type,
    //       debit,
    //       credit,
    //       runningBalance,
    //     });
    //   }

    //   beforeBalance = openingBalance;

    //   ledgerBalance = runningBalance;

    //   afterBalance = 0;

    //   totalOutstandingDue = runningBalance;
    // }
    if (!hasDateFilter) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required",
      });
    }
    // =====================================================
    // WITH DATE FILTER
    // =====================================================
    else {
      // ==========================================
      // 1. BEFORE DUE
      // ==========================================
      let balanceBeforeRange = openingBalance;

      for (const payment of sortedPayments) {
        const paymentDate = new Date(payment.paymentDate);

        // Range-এর আগে পর্যন্ত
        if (paymentDate >= start) {
          break;
        }

        const amount = Number(payment.amount || 0);
        const type = (payment.type || "").toLowerCase();

        const debit = type === "debit" ? amount : 0;
        const credit = type === "credit" ? amount : 0;

        balanceBeforeRange = balanceBeforeRange + debit - credit;
      }

      beforeBalance = balanceBeforeRange;

      // ==========================================
      // 2. SELECTED RANGE LEDGER
      // ==========================================
      let selectedRunningBalance = beforeBalance;

      for (const payment of sortedPayments) {
        const paymentDate = new Date(payment.paymentDate);

        // Range-এর আগে
        if (paymentDate < start) {
          continue;
        }

        // Range-এর পরে গেলে stop
        if (paymentDate > end) {
          break;
        }

        const amount = Number(payment.amount || 0);
        const type = (payment.type || "").toLowerCase();

        const debit = type === "debit" ? amount : 0;
        const credit = type === "credit" ? amount : 0;

        selectedRunningBalance = selectedRunningBalance + debit - credit;

        totalDebit += debit;
        totalCredit += credit;

        ledger.push({
          id: payment.id,
          date: payment.paymentDate,
          createdAt: payment.createdAt,
          details: payment.paymentMethod,
          subDetails: payment.note,
          type: payment.type,
          debit,
          credit,
          runningBalance: selectedRunningBalance,
        });
      }

      // ==========================================
      // 3. LEDGER BALANCE
      // ==========================================
      ledgerBalance = selectedRunningBalance;

      // ==========================================
      // 4. AFTER DUE
      //
      // Selected range শেষ হওয়ার পরের
      // সব transaction-এর NET amount
      // ==========================================
      let afterRangeBalance = 0;

      for (const payment of sortedPayments) {
        const paymentDate = new Date(payment.paymentDate);

        // Selected range-এর ভেতরের transaction skip
        if (paymentDate <= end) {
          continue;
        }

        const amount = Number(payment.amount || 0);
        const type = (payment.type || "").toLowerCase();

        const debit = type === "debit" ? amount : 0;
        const credit = type === "credit" ? amount : 0;

        afterRangeBalance = afterRangeBalance + debit - credit;
      }

      afterBalance = afterRangeBalance;

      // ==========================================
      // 5. TOTAL OUTSTANDING
      //
      // Ledger Balance + After Due
      // ==========================================
      totalOutstandingDue = ledgerBalance + afterBalance;
    }

    // =========================
    // REMOVE PAYMENTS FROM CLIENT
    // =========================
    const { payments, ...clientData } = client;

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,

      filter: {
        startDate: startDate || null,
        endDate: endDate || null,
      },

      data: {
        ...clientData,

        beforeBalance,

        totalDebit,

        totalCredit,

        ledgerBalance,

        afterBalance,

        totalOutstandingDue,

        ledger: ledger.reverse(),
      },
    });
  } catch (error) {
    console.error("getClientById error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
