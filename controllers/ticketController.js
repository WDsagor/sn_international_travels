import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const normalizeStatus = (status) =>
  String(status || "issued")
    .trim()
    .toLowerCase();

const getValidDate = (value) => {
  if (!hasValue(value)) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const ticketInclude = {
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
  airline: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
};

// সকল ticket পাওয়া
export const getTickets = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (hasValue(search)) {
      const keyword = String(search).trim();

      where.OR = [
        { pnrCode: { contains: keyword, mode: "insensitive" } },
        { passengerName: { contains: keyword, mode: "insensitive" } },
        {
          airline: {
            is: {
              OR: [
                { code: { contains: keyword, mode: "insensitive" } },
                { name: { contains: keyword, mode: "insensitive" } },
              ],
            },
          },
        },
        {
          client: {
            is: {
              fullName: { contains: keyword, mode: "insensitive" },
            },
          },
        },
      ];
    }

    if (hasValue(status) && status !== "All Status") {
      where.status = {
        equals: normalizeStatus(status),
        mode: "insensitive",
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: ticketInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Get Tickets Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};

// নতুন ticket তৈরি
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
      airlineCode,
      status,
      netCost,
      clientPrice,
      serviceCharge = 0,
      issuedById,
      clientId,
    } = req.body;

    if (
      !hasValue(pnrCode) ||
      !hasValue(ticketType) ||
      !hasValue(issueDate) ||
      !hasValue(passengerName) ||
      !hasValue(route) ||
      !hasValue(airlineCode) ||
      !hasValue(issuedById) ||
      !hasValue(clientId)
    ) {
      return res.status(400).json({
        message:
          "PNR, ticket type, issue date, passenger, route, airline, issuer and client are required!",
      });
    }

    const parsedIssueDate = getValidDate(issueDate);
    const parsedTravelDate = getValidDate(travelDate);

    if (!parsedIssueDate) {
      return res.status(400).json({
        message: "Invalid issue date!",
      });
    }

    if (hasValue(travelDate) && !parsedTravelDate) {
      return res.status(400).json({
        message: "Invalid travel date!",
      });
    }

    const cost = Number(netCost);
    const price = Number(clientPrice);
    const charge = Number(serviceCharge) || 0;

    if (
      !Number.isFinite(cost) ||
      !Number.isFinite(price) ||
      !Number.isFinite(charge) ||
      cost < 0 ||
      price < 0 ||
      charge < 0
    ) {
      return res.status(400).json({
        message: "Invalid financial amount!",
      });
    }

    const ticketStatus = normalizeStatus(status);
    const targetPnr = String(pnrCode).trim().toUpperCase();
    const targetAirlineCode = String(airlineCode).trim().toUpperCase();

    const formattedTravelDate = parsedTravelDate
      ? parsedTravelDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Dhaka",
        })
      : "N/A";

    const ticket = await prisma.$transaction(async (tx) => {
      const createdTicket = await tx.ticket.create({
        data: {
          pnrCode: targetPnr,
          ticketType,
          issueDate: parsedIssueDate,
          passengerName: String(passengerName).trim(),
          route: String(route).trim(),
          travelDate: parsedTravelDate,
          totalPax: String(totalPax || 1),
          status: ticketStatus,
          netCost: cost,
          clientPrice: price,
          serviceCharge: charge,
          netProfit: price - cost + charge,

          airline: {
            connect: {
              code: targetAirlineCode,
            },
          },

          issuedBy: {
            connect: {
              id: issuedById,
            },
          },

          client: {
            connect: {
              id: clientId,
            },
          },
        },
        include: ticketInclude,
      });

      await tx.payment.create({
        data: {
          clientId,
          amount: price,
          trxId: targetPnr,
          type: "debit",
          paymentDate: new Date(),
          paymentMethod: `Ticket ${ticketStatus.toUpperCase()} PNR - ${targetPnr}`,
          note: `PASSENGER: ${passengerName}. (${route}) (${formattedTravelDate})`,
        },
      });

      return createdTicket;
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully!",
      data: ticket,
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);

    if (error.code === "P2025") {
      return res.status(400).json({
        message: "Selected airline, client, or issuer was not found!",
      });
    }

    return res.status(500).json({
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};

// ticket update
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
      airlineCode,
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
      return res.status(404).json({
        message: "Ticket not found!",
      });
    }

    const oldStatus = normalizeStatus(oldTicket.status);
    const targetStatus = hasValue(status) ? normalizeStatus(status) : oldStatus;

    const isStatusChanged = oldStatus !== targetStatus;

    if (
      isStatusChanged &&
      targetStatus === "issued" &&
      ["reissue", "refund", "void"].includes(oldStatus)
    ) {
      return res.status(400).json({
        message:
          "You can not change a reissue, refund, or void ticket back to issued!",
      });
    }

    const oldPnr = String(oldTicket.pnrCode).trim().toUpperCase();
    const targetPnr = hasValue(pnrCode)
      ? String(pnrCode).trim().toUpperCase()
      : oldPnr;

    const targetAirlineCode = hasValue(airlineCode)
      ? String(airlineCode).trim().toUpperCase()
      : oldTicket.airlineCode;

    const targetIssuedById = hasValue(issuedById)
      ? issuedById
      : oldTicket.issuedById;

    const targetClientId = hasValue(clientId) ? clientId : oldTicket.clientId;

    const isPnrChanged = oldPnr !== targetPnr;
    const isClientChanged = oldTicket.clientId !== targetClientId;
    const isPriceChanged =
      hasValue(clientPrice) &&
      Number(clientPrice) !== Number(oldTicket.clientPrice);

    let parsedIssueDate = null;
    let parsedTravelDate = null;

    if (hasValue(issueDate)) {
      parsedIssueDate = getValidDate(issueDate);

      if (!parsedIssueDate) {
        return res.status(400).json({
          message: "Invalid issue date!",
        });
      }
    }

    if (hasValue(travelDate)) {
      parsedTravelDate = getValidDate(travelDate);

      if (!parsedTravelDate) {
        return res.status(400).json({
          message: "Invalid travel date!",
        });
      }
    }

    const oldTravelDate = oldTicket.travelDate
      ? new Date(oldTicket.travelDate)
      : null;

    const hasTravelDateChanged =
      parsedTravelDate !== null &&
      (!oldTravelDate ||
        parsedTravelDate.getTime() !== oldTravelDate.getTime());

    if (
      isStatusChanged &&
      targetStatus === "reissue" &&
      oldStatus !== "reissue" &&
      !hasTravelDateChanged
    ) {
      return res.status(400).json({
        message:
          "Travel date must be changed for the first-time ticket reissue!",
      });
    }

    const cost = hasValue(netCost)
      ? Number(netCost)
      : Number(oldTicket.netCost);

    const price = hasValue(clientPrice)
      ? Number(clientPrice)
      : Number(oldTicket.clientPrice);

    const isChargeInputted = hasValue(serviceCharge);
    const inputCharge = isChargeInputted ? Number(serviceCharge) : null;
    const oldCharge = Number(oldTicket.serviceCharge || 0);

    if (
      !Number.isFinite(cost) ||
      !Number.isFinite(price) ||
      (inputCharge !== null && !Number.isFinite(inputCharge)) ||
      cost < 0 ||
      price < 0 ||
      (inputCharge !== null && inputCharge < 0)
    ) {
      return res.status(400).json({
        message: "Invalid financial amount!",
      });
    }

    const oldNetProfit = Number(oldTicket.netProfit || 0);

    let finalServiceCharge = oldCharge;
    let calculatedNetProfit = oldNetProfit;
    let latestReissuePayment = null;

    if (["refund", "void"].includes(targetStatus)) {
      const refundVoidCharge = isChargeInputted ? inputCharge : 0;

      // আগের service charge + নতুন refund/void charge
      finalServiceCharge = oldCharge + refundVoidCharge;

      // আগের ticket profit + নতুন refund/void charge
      calculatedNetProfit = oldNetProfit + refundVoidCharge;
    } else if (targetStatus === "reissue") {
      finalServiceCharge = hasTravelDateChanged
        ? oldCharge + (inputCharge || 0)
        : oldCharge;

      calculatedNetProfit = price - cost + finalServiceCharge;
    } else {
      finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;
      calculatedNetProfit = price - cost + finalServiceCharge;
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      if (
        targetStatus === "reissue" &&
        !hasTravelDateChanged &&
        isChargeInputted
      ) {
        latestReissuePayment = await tx.payment.findFirst({
          where: {
            trxId: targetPnr,
            type: "debit",
            paymentMethod: {
              contains: "REISSUE",
              mode: "insensitive",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        finalServiceCharge = latestReissuePayment
          ? oldCharge - Number(latestReissuePayment.amount || 0) + inputCharge
          : inputCharge;

        calculatedNetProfit = price - cost + finalServiceCharge;
      }

      if (isPnrChanged || isClientChanged) {
        await tx.payment.updateMany({
          where: { trxId: oldPnr },
          data: {
            ...(isPnrChanged && { trxId: targetPnr }),
            ...(isClientChanged && { clientId: targetClientId }),
          },
        });
      }

      if (isPriceChanged) {
        await tx.payment.updateMany({
          where: {
            trxId: targetPnr,
            type: "debit",
            paymentMethod: {
              startsWith: "Ticket ",
            },
          },
          data: {
            amount: price,
            clientId: targetClientId,
          },
        });
      }

      if (
        targetStatus === "reissue" &&
        hasTravelDateChanged &&
        inputCharge > 0
      ) {
        const formattedDate = parsedTravelDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Dhaka",
        });

        await tx.payment.create({
          data: {
            clientId: targetClientId,
            amount: inputCharge,
            trxId: targetPnr,
            type: "debit",
            paymentDate: new Date(),
            paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,
            note: `Reissue Date Change Charge: PNR - ${targetPnr} (${formattedDate})`,
          },
        });
      } else if (
        targetStatus === "reissue" &&
        isChargeInputted &&
        latestReissuePayment
      ) {
        await tx.payment.update({
          where: { id: latestReissuePayment.id },
          data: {
            amount: inputCharge,
            clientId: targetClientId,
            trxId: targetPnr,
          },
        });
      }

      if (isStatusChanged && ["refund", "void"].includes(targetStatus)) {
        const netRefundAmount = price - finalServiceCharge;

        if (netRefundAmount > 0) {
          await tx.payment.create({
            data: {
              clientId: targetClientId,
              amount: netRefundAmount,
              trxId: targetPnr,
              type: "credit",
              paymentDate: new Date(),
              paymentMethod: `${targetStatus.toUpperCase()} Return, PNR - ${targetPnr}`,
              note: `PNR - ${targetPnr} (${targetStatus.toUpperCase()} return amount after service charge: ${finalServiceCharge})`,
            },
          });
        }
      }

      return tx.ticket.update({
        where: { id },
        data: {
          pnrCode: targetPnr,
          ticketType: hasValue(ticketType) ? ticketType : oldTicket.ticketType,
          issueDate: parsedIssueDate || oldTicket.issueDate,
          passengerName: hasValue(passengerName)
            ? passengerName
            : oldTicket.passengerName,
          route: hasValue(route) ? route : oldTicket.route,
          travelDate: parsedTravelDate || oldTicket.travelDate,
          totalPax: hasValue(totalPax) ? String(totalPax) : oldTicket.totalPax,
          status: targetStatus,
          netCost: cost,
          clientPrice: price,
          serviceCharge: finalServiceCharge,
          netProfit: calculatedNetProfit,

          ...(targetAirlineCode !== oldTicket.airlineCode && {
            airline: {
              connect: {
                code: targetAirlineCode,
              },
            },
          }),

          ...(targetIssuedById !== oldTicket.issuedById && {
            issuedBy: {
              connect: {
                id: targetIssuedById,
              },
            },
          }),

          ...(targetClientId !== oldTicket.clientId && {
            client: {
              connect: {
                id: targetClientId,
              },
            },
          }),
        },
        include: ticketInclude,
      });
    });

    return res.status(200).json({
      success: true,
      message: `Ticket updated successfully (${updatedTicket.status})!`,
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Update Ticket Error:", error);

    if (error.code === "P2025") {
      return res.status(400).json({
        message: "Selected airline, client, or issuer was not found!",
      });
    }

    return res.status(500).json({
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};

// ticket delete
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found!",
      });
    }

    await prisma.ticket.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Ticket Error:", error);

    return res.status(500).json({
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};
