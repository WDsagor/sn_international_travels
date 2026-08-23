import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ----------------------------------------------------
// 1. CREATE PAYMENT
// ----------------------------------------------------
export const createPayment = async (req, res) => {
  try {
    const { clientId, amount, paymentDate, paymentMethod, trxId, note } =
      req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Please select a client.",
      });
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid payment amount.",
      });
    }

    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!clientExists) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    let formattedNote = note ? note.trim() : "";
    const cleanTrxId = trxId ? trxId.trim() : null;

    const newPayment = await prisma.payment.create({
      data: {
        clientId,
        amount: Number(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod: paymentMethod || "Cash",
        type: "credit",
        trxId: cleanTrxId,
        note: formattedNote || null,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully!",
      data: newPayment,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing payment.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 2. GET ALL PAYMENTS
// ----------------------------------------------------
export const getAllPayments = async (req, res) => {
  try {
    const { search, paymentMethod, clientId } = req.query;
    const whereClause = {};

    if (clientId) {
      whereClause.clientId = clientId;
    }

    if (paymentMethod) {
      whereClause.paymentMethod = {
        equals: paymentMethod,
        mode: "insensitive",
      };
    }

    if (search && search.trim() !== "") {
      const searchTerm = search.trim();
      whereClause.OR = [
        { trxId: { contains: searchTerm, mode: "insensitive" } },
        { note: { contains: searchTerm, mode: "insensitive" } },
        {
          client: {
            fullName: { contains: searchTerm, mode: "insensitive" },
          },
        },
        {
          client: {
            phone: { contains: searchTerm, mode: "insensitive" },
          },
        },
      ];
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            company: true,
          },
        },
      },
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
    });
    // payments.sort(
    //   (a, b) =>
    //     new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    // );
    const formattedPayments = payments.map((payment) => ({
      ...payment,
      formattedDate: new Date(payment.paymentDate).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    return res.status(200).json({
      success: true,
      count: payments.length,
      data: formattedPayments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payments.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 3. GET PAYMENT BY ID
// ----------------------------------------------------
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined" || id === "null") {
      return res.status(400).json({
        success: false,
        message: "Valid Payment ID is required.",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            company: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment entry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment details.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 4. UPDATE PAYMENT
// ----------------------------------------------------
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, trxId, note } = req.body;

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    let formattedNote = note !== undefined ? note : existingPayment.note;
    const cleanTrxId =
      trxId !== undefined
        ? trxId
          ? trxId.trim()
          : null
        : existingPayment.trxId;

    if (cleanTrxId && trxId !== existingPayment.trxId) {
      const matchedTicket = await prisma.ticket.findFirst({
        where: {
          pnrCode: {
            equals: cleanTrxId,
            mode: "insensitive",
          },
          clientId: existingPayment.clientId,
        },
      });

      const pnrRefText = matchedTicket
        ? `[Payment for PNR: ${matchedTicket.pnrCode}]`
        : `[Ref/TrxID: ${cleanTrxId}]`;

      formattedNote = formattedNote
        ? `${pnrRefText} - ${formattedNote}`
        : pnrRefText;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount ? Number(amount) : existingPayment.amount,
        paymentDate: paymentDate
          ? new Date(paymentDate)
          : existingPayment.paymentDate,
        paymentMethod: paymentMethod || existingPayment.paymentMethod,
        trxId: cleanTrxId,
        note: formattedNote,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment record updated successfully.",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating payment.",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 5. DELETE PAYMENT
// ----------------------------------------------------
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    await prisma.payment.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Payment record deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting payment.",
      error: error.message,
    });
  }
};
