import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ----------------------------------------------------
// 1. GET ALL TICKETS
// ----------------------------------------------------
export const getTickets = async (req, res) => {
  try {
    const { search, status } = req.query;
    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { pnrCode: { contains: search, mode: "insensitive" } },
        { passengerName: { contains: search, mode: "insensitive" } },
        { airline: { contains: search, mode: "insensitive" } },
        {
          client: {
            fullName: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (status && status !== "All Status") {
      whereClause.status = { equals: status, mode: "insensitive" };
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        issuedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Get Tickets Error:", error);
    res.status(500).json({
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 2. CREATE TICKET
// ----------------------------------------------------
export const createTicket = async (req, res) => {
  try {
    const {
      pnrCode,
      ticketType,
      issueDate,
      passengerName,
      route,
      travelDate,
      totalPax,
      airline,
      status,
      netCost,
      clientPrice,
      serviceCharge = 0,
      issuedById,
      clientId,
    } = req.body;

    if (!issuedById || !clientId) {
      return res.status(400).json({
        message: "issuedById and clientId are required!",
      });
    }

    const charge = Number(serviceCharge) || 0;
    const cost = Number(netCost) || 0;
    const price = Number(clientPrice) || 0;

    const calculatedProfit = price - cost + charge;

    const result = await prisma.$transaction(
      async (tx) => {
        const ticket = await tx.ticket.create({
          data: {
            pnrCode,
            ticketType,
            issueDate: new Date(issueDate),
            passengerName,
            route,
            travelDate: travelDate ? new Date(travelDate) : null,
            totalPax: String(totalPax || 1),
            airline,
            status: status || "Issued",
            netCost: cost,
            clientPrice: price,
            serviceCharge: charge,
            netProfit: calculatedProfit,
            issuedById,
            clientId,
          },
        });

        // স্টাফের প্রফিট আপডেট করা হচ্ছে
        await tx.user.update({
          where: { id: issuedById },
          data: {
            totalProfit: { increment: calculatedProfit },
          },
        });

        return ticket;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    res.status(201).json({
      message: "Ticket created successfully!",
      data: result,
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 3. UPDATE TICKET
// ----------------------------------------------------
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pnrCode,
      ticketType,
      issueDate,
      passengerName,
      route,
      travelDate,
      totalPax,
      airline,
      status,
      netCost,
      clientPrice,
      serviceCharge = 0,
      issuedById,
      clientId,
    } = req.body;

    const oldTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!oldTicket) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    const currentCost = Number(netCost) || 0;
    const currentPrice = Number(clientPrice) || 0;
    const currentCharge = Number(serviceCharge) || 0;

    let newNetProfit = 0;

    if (status === "Refunded" || status === "Voided") {
      newNetProfit = currentCharge;
    } else {
      newNetProfit = currentPrice - currentCost + currentCharge;
    }

    const oldProfit = oldTicket.netProfit;
    const targetIssuedById = issuedById || oldTicket.issuedById;
    const targetClientId = clientId || oldTicket.clientId;

    const updatedTicket = await prisma.$transaction(
      async (tx) => {
        // পুরোনো ইউজারের প্রফিট রিভার্ট করা
        await tx.user.update({
          where: { id: oldTicket.issuedById },
          data: { totalProfit: { decrement: oldProfit } },
        });

        // টিকিট আপডেট
        const ticket = await tx.ticket.update({
          where: { id },
          data: {
            pnrCode,
            ticketType,
            issueDate: new Date(issueDate),
            passengerName,
            route,
            travelDate: travelDate ? new Date(travelDate) : null,
            totalPax: String(totalPax || 1),
            airline,
            status,
            netCost: currentCost,
            clientPrice: currentPrice,
            serviceCharge: currentCharge,
            netProfit: newNetProfit,
            issuedById: targetIssuedById,
            clientId: targetClientId,
          },
        });

        // নতুন ইউজারের প্রফিট অ্যাড করা
        await tx.user.update({
          where: { id: targetIssuedById },
          data: { totalProfit: { increment: newNetProfit } },
        });

        return ticket;
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    res.status(200).json({
      message: `Ticket updated successfully (${status})!`,
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Update Ticket Error:", error);
    res.status(500).json({
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};

// ----------------------------------------------------
// 4. DELETE TICKET
// ----------------------------------------------------
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: { id: ticket.issuedById },
          data: { totalProfit: { decrement: ticket.netProfit } },
        });

        await tx.ticket.delete({
          where: { id },
        });
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    res.status(200).json({
      message: "Ticket deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Ticket Error:", error);
    res.status(500).json({
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};
