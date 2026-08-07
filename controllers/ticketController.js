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
        await tx.payment.create({
          data: {
            clientId: clientId,
            amount: price,
            type: "debit",
            paymentMethod: `Ticket ${status?.toUpperCase()} PNR - ${pnrCode?.toUpperCase()}`,
            paymentDate: new Date(),
            note: ` PASSENGER: ${passengerName}. (${route})`,
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
      serviceCharge,
      issuedById,
      clientId,
    } = req.body;

    const oldTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!oldTicket) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    const charge = Number(serviceCharge) || 0;
    const cost = Number(netCost) || 0;
    const price = Number(clientPrice) || 0;

    let newNetProfit = 0;

    if (status === "refund" || status === "void") {
      newNetProfit = charge;
    } else {
      newNetProfit = price - cost + charge;
    }

    // const oldProfit = oldTicket.netProfit;
    const targetIssuedById = issuedById || oldTicket.issuedById;
    const targetClientId = clientId || oldTicket.clientId;

    const updatedTicket = await prisma.$transaction(
      async (tx) => {
        if (charge > 0) {
          await tx.user.update({
            where: { id: oldTicket.issuedById },
            data: { totalProfit: { increment: charge } },
          });
        }

        // ২. টিকিট আপডেট করা
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
            netCost: cost,
            clientPrice: price,
            serviceCharge: charge,
            netProfit: newNetProfit,
            issuedById: targetIssuedById,
            clientId: targetClientId,
          },
        });

        if (status === "refund" || status === "void") {
          const netRefundAmount = oldTicket.clientPrice - charge;

          if (netRefundAmount > 0) {
            await tx.payment.create({
              data: {
                clientId: targetClientId,
                amount: netRefundAmount,
                type: "credit",
                paymentMethod: `${status?.toUpperCase()} Return`,
                paymentDate: new Date(),
                note: `PNR - ${ticket?.pnrCode?.toUpperCase()}  (${status} after return amount. (${ticket.route})`,
              },
            });
          }
        } else if (status === "reissue" && charge > 0) {
          // Reissue হলে যদি কোনো সার্ভিস চার্জ থাকে, তা নেগেটিভ অ্যামাউন্ট (ডিউ বৃদ্ধি) হিসেবে এন্ট্রি হবে
          await tx.payment.create({
            data: {
              clientId: targetClientId,
              amount: charge,
              type: "debit",
              paymentDate: new Date(),
              paymentMethod: `${status?.toUpperCase()} Charge`,
              note: `Reissue Charge: PNR - ${ticket?.pnrCode.toUpperCase()} (${ticket.route})`,
            },
          });
        }

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
