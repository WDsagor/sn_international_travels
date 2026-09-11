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
    const formattedDateStr = new Date(travelDate).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    });
    const result = await prisma.$transaction(
      async (tx) => {
        const ticket = await tx.ticket.create({
          data: {
            pnrCode: pnrCode?.toUpperCase(),
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
            trxId: pnrCode?.toUpperCase(),
            type: "debit",
            paymentMethod: `Ticket ${status?.toUpperCase()} PNR - ${pnrCode?.toUpperCase()}`,
            paymentDate: new Date(),
            note: ` PASSENGER: ${passengerName}. (${route}) ( ${formattedDateStr})`,
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

// export const updateTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       pnrCode,
//       ticketType,
//       issueDate,
//       passengerName,
//       route,
//       travelDate,
//       totalPax,
//       airline,
//       status,
//       netCost,
//       clientPrice,
//       serviceCharge,
//       issuedById,
//       clientId,
//     } = req.body;

//     // ১. আগের টিকিট ডাটাবেজ থেকে খুঁজে বের করা
//     const oldTicket = await prisma.ticket.findUnique({ where: { id } });
//     if (!oldTicket) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }

//     const targetStatus = (status || oldTicket.status).toLowerCase();
//     const oldStatus = oldTicket.status.toLowerCase();
//     const isStatusChanged = oldStatus !== targetStatus;

//     const isTravelDateChanged =
//       travelDate &&
//       new Date(travelDate).toISOString() !==
//         new Date(oldTicket.travelDate).toISOString();

//     // =========================================================
//     // 🛑 VALIDATION: প্রথমবার Reissue করতে হলে Travel Date চেঞ্জ হতে হবে
//     // =========================================================
//     if (isStatusChanged && targetStatus === "reissue" && !isTravelDateChanged) {
//       return res.status(400).json({
//         message:
//           "Travel date must be changed to perform the first-time ticket reissue!",
//       });
//     }
//     if (isStatusChanged && targetStatus === "issued") {
//       return res.status(400).json({
//         message: "You can not change status reissue or refund/void ticket",
//       });
//     }

//     // ইনপুট ভ্যালু পার্সিং ও ফলব্যাক
//     const inputCharge = serviceCharge !== undefined ? Number(serviceCharge) : 0;
//     const oldCharge = Number(oldTicket.serviceCharge || 0);

//     const cost =
//       netCost !== undefined ? Number(netCost) : Number(oldTicket.netCost || 0);
//     const price =
//       clientPrice !== undefined
//         ? Number(clientPrice)
//         : Number(oldTicket.clientPrice || 0);

//     const targetPnr = (pnrCode || oldTicket.pnrCode).trim().toUpperCase();
//     const oldPnr = oldTicket.pnrCode.trim().toUpperCase();

//     const targetIssuedById = issuedById || oldTicket.issuedById;
//     const oldIssuedById = oldTicket.issuedById;

//     const targetClientId = clientId || oldTicket.clientId;
//     const oldClientId = oldTicket.clientId;

//     const oldNetProfit = Number(oldTicket.netProfit || 0);

//     const isUserChanged = oldIssuedById !== targetIssuedById;
//     const isClientChanged = oldClientId !== targetClientId;
//     const isPnrChanged = oldPnr !== targetPnr;
//     const isChargeInputted = serviceCharge !== undefined;

//     const formattedTravelDate = travelDate
//       ? new Date(travelDate).toISOString()
//       : oldTicket.travelDate;

//     // =========================================================
//     // ২. সার্ভিস চার্জ ও NET PROFIT ক্যালকুলেশন
//     // =========================================================
//     let finalServiceCharge = oldCharge;
//     let calculatedNetProfit = 0;

//     if (targetStatus === "refund" || targetStatus === "void") {
//       // রিফান্ড বা ভয়েড হলে মূল বিক্রি-কেনার মার্জিন জিরো হয়ে কেবল সার্ভিস চার্জই লাভ থাকবে
//       finalServiceCharge = isChargeInputted && inputCharge + oldCharge;
//       calculatedNetProfit = finalServiceCharge;
//     } else if (targetStatus === "reissue") {
//       if (isTravelDateChanged) {
//         // নতুন ডেট চেঞ্জ হলে আগের সার্ভিস চার্জের সাথে নতুন চার্জ যোগ হবে
//         finalServiceCharge = oldCharge + inputCharge;
//       } else if (isChargeInputted) {
//         // ডেট চেঞ্জ না করে শুধু সার্ভিস চার্জ ওভাররাইড করতে চাইলে
//         finalServiceCharge = inputCharge;
//       }
//       // রিইস্যুর ক্ষেত্রে নেট প্রফিট = (বিক্রি - কেনা) + মোট নতুন সার্ভিস চার্জ
//       calculatedNetProfit = price - cost + finalServiceCharge;
//     } else {
//       // সাধারণ / Issue স্ট্যাটাসের জন্য
//       finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;
//       calculatedNetProfit = price - cost + finalServiceCharge;
//     }

//     const profitDifference = calculatedNetProfit - oldNetProfit;

//     const updatedTicket = await prisma.$transaction(
//       async (tx) => {
//         // =========================================================
//         // ৩. USER PROFIT ADJUSTMENT
//         // =========================================================
//         if (isUserChanged) {
//           // আগের ইউজারের অ্যাকাউন্ট থেকে পুরো পুরোনো প্রফিট বাদ
//           if (oldNetProfit > 0) {
//             await tx.user.update({
//               where: { id: oldIssuedById },
//               data: { totalProfit: { decrement: oldNetProfit } },
//             });
//           }
//           // নতুন ইউজারের অ্যাকাউন্টে নতুন মোট প্রফিট যোগ
//           if (calculatedNetProfit > 0) {
//             await tx.user.update({
//               where: { id: targetIssuedById },
//               data: { totalProfit: { increment: calculatedNetProfit } },
//             });
//           }
//         } else if (profitDifference !== 0) {
//           // একই ইউজার হলে শুধু পার্থক্যের টাকা এডজাস্ট হবে
//           await tx.user.update({
//             where: { id: targetIssuedById },
//             data: {
//               totalProfit:
//                 profitDifference > 0
//                   ? { increment: profitDifference }
//                   : { decrement: Math.abs(profitDifference) },
//             },
//           });
//         }

//         // =========================================================
//         // ৪. PAYMENT / CLIENT / PNR TRANSFER
//         // =========================================================
//         if (isPnrChanged || isClientChanged) {
//           await tx.payment.updateMany({
//             where: { trxId: { contains: oldPnr } },
//             data: {
//               ...(isClientChanged && { clientId: targetClientId }),
//               ...(isPnrChanged && { trxId: targetPnr }),
//             },
//           });
//         }

//         // =========================================================
//         // ৫. REISSUE LOGIC (Payment & Charge History)
//         // =========================================================
//         if (targetStatus === "reissue") {
//           // ক) প্রথমবার রিইস্যু বা পরবর্তীতে নতুন ডেট চেঞ্জ হলে চার্জের জন্য নতুন Debit Entry
//           if (isTravelDateChanged && inputCharge > 0) {
//             const formattedDateStr = new Date(travelDate).toLocaleDateString(
//               "en-GB",
//               {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//                 timeZone: "Asia/Dhaka",
//               },
//             );

//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,
//                 amount: inputCharge,
//                 trxId: targetPnr,
//                 type: "debit",
//                 paymentDate: new Date(),
//                 paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,
//                 note: `Reissue Date Change Charge: PNR - ${targetPnr} (${formattedDateStr})`,
//               },
//             });
//           }
//           // খ) ডেট চেঞ্জ না করে সার্ভিস চার্জ কমানো/ বাড়ানো হলে শেষ রিইস্যু পেমেন্ট আপডেট
//           else if (!isTravelDateChanged && isChargeInputted) {
//             const latestReissuePayment = await tx.payment.findFirst({
//               where: {
//                 trxId: { contains: targetPnr },
//                 paymentMethod: { contains: "REISSUE", mode: "insensitive" },
//               },
//               orderBy: { createdAt: "desc" },
//             });

//             if (latestReissuePayment) {
//               await tx.payment.update({
//                 where: { id: latestReissuePayment.id },
//                 data: { amount: inputCharge },
//               });
//             }
//           }
//         }

//         // =========================================================
//         // ৬. REFUND OR VOID LOGIC
//         // =========================================================
//         if (
//           isStatusChanged &&
//           (targetStatus === "refund" || targetStatus === "void")
//         ) {
//           // ক্যানসেলেশন/সার্ভিস চার্জ কেটে বাকি টাকা ক্লায়েন্টকে ক্রেডিট হিসেবে ফেরত
//           const netRefundAmount = price - finalServiceCharge;

//           if (netRefundAmount > 0) {
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,
//                 amount: netRefundAmount,
//                 trxId: targetPnr,
//                 type: "credit",
//                 paymentMethod: `${targetStatus.toUpperCase()} Return, PNR - ${targetPnr}`,
//                 paymentDate: new Date(),
//                 note: `PNR - ${targetPnr} (${targetStatus.toUpperCase()} return amount after service charge: ${finalServiceCharge})`,
//               },
//             });
//           }
//         }

//         // =========================================================
//         // ৭. TICKET DATA UPDATE (একক নিরাপদ আপডেট)
//         // =========================================================
//         const updated = await tx.ticket.update({
//           where: { id },
//           data: {
//             pnrCode: targetPnr,
//             ticketType: ticketType || oldTicket.ticketType,
//             issueDate: issueDate ? new Date(issueDate) : oldTicket.issueDate,
//             passengerName: passengerName || oldTicket.passengerName,
//             route: route || oldTicket.route,
//             travelDate: formattedTravelDate,
//             totalPax: String(totalPax || oldTicket.totalPax || 1),
//             airline: airline || oldTicket.airline,
//             status: targetStatus,
//             netCost: cost,
//             clientPrice: price,
//             serviceCharge: finalServiceCharge,
//             netProfit: calculatedNetProfit,
//             issuedById: targetIssuedById,
//             clientId: targetClientId,
//           },
//         });

//         return updated;
//       },
//       {
//         maxWait: 10000,
//         timeout: 20000,
//       },
//     );

//     return res.status(200).json({
//       message: `Ticket updated successfully (${updatedTicket.status})!`,
//       data: updatedTicket,
//     });
//   } catch (error) {
//     console.error("Update Ticket Error:", error);
//     return res.status(500).json({
//       message: "Failed to update ticket",
//       error: error.message,
//     });
//   }
// };

// export const updateTicket = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       pnrCode,
//       ticketType,
//       issueDate,
//       passengerName,
//       route,
//       travelDate,
//       totalPax,
//       airline,
//       status,
//       netCost,
//       clientPrice,
//       serviceCharge,
//       issuedById,
//       clientId,
//     } = req.body;

//     // =========================================================
//     // 1. FIND OLD TICKET
//     // =========================================================

//     const oldTicket = await prisma.ticket.findUnique({
//       where: { id },
//     });

//     if (!oldTicket) {
//       return res.status(404).json({
//         message: "Ticket not found!",
//       });
//     }

//     // =========================================================
//     // 2. NORMALIZE STATUS
//     // =========================================================

//     const targetStatus = (
//       status !== undefined && status !== null
//         ? String(status)
//         : String(oldTicket.status)
//     )
//       .trim()
//       .toLowerCase();

//     const oldStatus = String(oldTicket.status).trim().toLowerCase();

//     const isStatusChanged = oldStatus !== targetStatus;

//     // =========================================================
//     // 3. STATUS VALIDATION
//     // =========================================================

//     // Reissue / Refund / Void ticket cannot be changed back to Issued
//     if (
//       isStatusChanged &&
//       targetStatus === "issued" &&
//       ["reissue", "refund", "void"].includes(oldStatus)
//     ) {
//       return res.status(400).json({
//         message:
//           "You can not change a reissue, refund, or void ticket back to issued!",
//       });
//     }

//     // =========================================================
//     // 4. NORMALIZE PNR
//     // =========================================================

//     const targetPnr = (
//       pnrCode !== undefined && pnrCode !== null
//         ? String(pnrCode)
//         : String(oldTicket.pnrCode)
//     )
//       .trim()
//       .toUpperCase();

//     const oldPnr = String(oldTicket.pnrCode).trim().toUpperCase();

//     if (!targetPnr) {
//       return res.status(400).json({
//         message: "PNR code is required!",
//       });
//     }

//     const isPnrChanged = oldPnr !== targetPnr;

//     // =========================================================
//     // 5. USER / CLIENT
//     // =========================================================

//     const targetIssuedById =
//       issuedById !== undefined && issuedById !== null
//         ? issuedById
//         : oldTicket.issuedById;

//     const oldIssuedById = oldTicket.issuedById;

//     const targetClientId =
//       clientId !== undefined && clientId !== null
//         ? clientId
//         : oldTicket.clientId;

//     const oldClientId = oldTicket.clientId;

//     const isUserChanged = oldIssuedById !== targetIssuedById;

//     const isClientChanged = oldClientId !== targetClientId;

//     // =========================================================
//     // 6. TRAVEL DATE VALIDATION
//     // =========================================================

//     let parsedTravelDate = null;

//     if (
//       travelDate !== undefined &&
//       travelDate !== null &&
//       String(travelDate).trim() !== ""
//     ) {
//       parsedTravelDate = new Date(travelDate);

//       if (Number.isNaN(parsedTravelDate.getTime())) {
//         return res.status(400).json({
//           message: "Invalid travel date!",
//         });
//       }
//     }

//     const oldTravelDate = oldTicket.travelDate
//       ? new Date(oldTicket.travelDate)
//       : null;

//     if (oldTravelDate && Number.isNaN(oldTravelDate.getTime())) {
//       return res.status(500).json({
//         message: "Existing ticket has an invalid travel date!",
//       });
//     }

//     const isTravelDateChanged =
//       parsedTravelDate !== null &&
//       oldTravelDate !== null &&
//       parsedTravelDate.getTime() !== oldTravelDate.getTime();

//     const isTravelDateAdded =
//       parsedTravelDate !== null && oldTravelDate === null;

//     const hasTravelDateChanged = isTravelDateChanged || isTravelDateAdded;

//     // =========================================================
//     // 7. FIRST TIME REISSUE VALIDATION
//     // =========================================================

//     if (
//       isStatusChanged &&
//       targetStatus === "reissue" &&
//       oldStatus !== "reissue" &&
//       !hasTravelDateChanged
//     ) {
//       return res.status(400).json({
//         message:
//           "Travel date must be changed for the first-time ticket reissue!",
//       });
//     }

//     // =========================================================
//     // 8. ISSUE DATE VALIDATION
//     // =========================================================

//     let parsedIssueDate = null;

//     if (
//       issueDate !== undefined &&
//       issueDate !== null &&
//       String(issueDate).trim() !== ""
//     ) {
//       parsedIssueDate = new Date(issueDate);

//       if (Number.isNaN(parsedIssueDate.getTime())) {
//         return res.status(400).json({
//           message: "Invalid issue date!",
//         });
//       }
//     }

//     // =========================================================
//     // 9. FINANCIAL VALUES
//     // =========================================================

//     const isChargeInputted =
//       serviceCharge !== undefined && serviceCharge !== null;

//     const inputCharge = isChargeInputted ? Number(serviceCharge) : null;

//     const oldCharge = Number(oldTicket.serviceCharge || 0);

//     const cost =
//       netCost !== undefined && netCost !== null && String(netCost).trim() !== ""
//         ? Number(netCost)
//         : Number(oldTicket.netCost || 0);

//     const price =
//       clientPrice !== undefined &&
//       clientPrice !== null &&
//       String(clientPrice).trim() !== ""
//         ? Number(clientPrice)
//         : Number(oldTicket.clientPrice || 0);

//     const oldNetProfit = Number(oldTicket.netProfit || 0);

//     // =========================================================
//     // 10. FINANCIAL VALIDATION
//     // =========================================================

//     if (
//       !Number.isFinite(cost) ||
//       !Number.isFinite(price) ||
//       (inputCharge !== null && !Number.isFinite(inputCharge))
//     ) {
//       return res.status(400).json({
//         message: "Invalid financial amount!",
//       });
//     }

//     if (inputCharge !== null && inputCharge < 0) {
//       return res.status(400).json({
//         message: "Service charge cannot be negative!",
//       });
//     }

//     // =========================================================
//     // 11. FINAL TRAVEL DATE
//     // =========================================================

//     const formattedTravelDate =
//       parsedTravelDate !== null ? parsedTravelDate : oldTicket.travelDate;

//     // =========================================================
//     // 12. INITIAL PROFIT / CHARGE VALUES
//     // =========================================================

//     let finalServiceCharge = oldCharge;

//     let calculatedNetProfit = oldNetProfit;

//     // This will be used when editing latest reissue payment
//     let latestReissuePayment = null;

//     // =========================================================
//     // 13. SERVICE CHARGE + PROFIT CALCULATION
//     // =========================================================

//     // ---------------------------------------------------------
//     // REFUND / VOID
//     // ---------------------------------------------------------

//     if (targetStatus === "refund" || targetStatus === "void") {
//       // For refund/void, entered charge replaces old charge.
//       finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;

//       calculatedNetProfit = finalServiceCharge;
//     }

//     // ---------------------------------------------------------
//     // REISSUE
//     // ---------------------------------------------------------
//     else if (targetStatus === "reissue") {
//       // -------------------------------------------------------
//       // NEW REISSUE / TRAVEL DATE CHANGED
//       // -------------------------------------------------------

//       if (hasTravelDateChanged) {
//         finalServiceCharge =
//           oldCharge + (inputCharge !== null ? inputCharge : 0);
//       }

//       // -------------------------------------------------------
//       // EDIT EXISTING LATEST REISSUE CHARGE
//       // -------------------------------------------------------
//       else if (isChargeInputted) {
//         finalServiceCharge = oldCharge;
//       }

//       calculatedNetProfit = price - cost + finalServiceCharge;
//     }

//     // ---------------------------------------------------------
//     // NORMAL / ISSUED
//     // ---------------------------------------------------------
//     else {
//       finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;

//       calculatedNetProfit = price - cost + finalServiceCharge;
//     }

//     // =========================================================
//     // 14. TRANSACTION
//     // =========================================================

//     const updatedTicket = await prisma.$transaction(
//       async (tx) => {
//         // =====================================================
//         // A. REISSUE - FIND LATEST PAYMENT FIRST
//         // =====================================================

//         if (
//           targetStatus === "reissue" &&
//           !hasTravelDateChanged &&
//           isChargeInputted
//         ) {
//           latestReissuePayment = await tx.payment.findFirst({
//             where: {
//               trxId: targetPnr,

//               paymentMethod: {
//                 contains: "REISSUE",
//                 mode: "insensitive",
//               },
//             },

//             orderBy: {
//               createdAt: "desc",
//             },
//           });

//           if (latestReissuePayment) {
//             finalServiceCharge =
//               oldCharge -
//               Number(latestReissuePayment.amount || 0) +
//               inputCharge;

//             calculatedNetProfit = price - cost + finalServiceCharge;
//           } else {
//             finalServiceCharge = inputCharge;

//             calculatedNetProfit = price - cost + finalServiceCharge;
//           }
//         }

//         // =====================================================
//         // B. USER PROFIT ADJUSTMENT
//         // =====================================================

//         const oldUserProfit = Math.max(oldNetProfit, 0);

//         const newUserProfit = Math.max(calculatedNetProfit, 0);

//         if (isUserChanged) {
//           // Remove old profit from old user
//           if (oldIssuedById && oldUserProfit > 0) {
//             await tx.user.update({
//               where: {
//                 id: oldIssuedById,
//               },

//               data: {
//                 totalProfit: {
//                   decrement: oldUserProfit,
//                 },
//               },
//             });
//           }

//           // Add new profit to new user
//           if (targetIssuedById && newUserProfit > 0) {
//             await tx.user.update({
//               where: {
//                 id: targetIssuedById,
//               },

//               data: {
//                 totalProfit: {
//                   increment: newUserProfit,
//                 },
//               },
//             });
//           }
//         } else {
//           const profitDifference = newUserProfit - oldUserProfit;

//           if (targetIssuedById && profitDifference !== 0) {
//             if (profitDifference > 0) {
//               await tx.user.update({
//                 where: {
//                   id: targetIssuedById,
//                 },

//                 data: {
//                   totalProfit: {
//                     increment: profitDifference,
//                   },
//                 },
//               });
//             } else {
//               await tx.user.update({
//                 where: {
//                   id: targetIssuedById,
//                 },

//                 data: {
//                   totalProfit: {
//                     decrement: Math.abs(profitDifference),
//                   },
//                 },
//               });
//             }
//           }
//         }

//         // =====================================================
//         // C. PAYMENT PNR / CLIENT TRANSFER
//         // =====================================================

//         if (isPnrChanged || isClientChanged) {
//           await tx.payment.updateMany({
//             where: {
//               trxId: oldPnr,
//             },

//             data: {
//               ...(isClientChanged && {
//                 clientId: targetClientId,
//               }),

//               ...(isPnrChanged && {
//                 trxId: targetPnr,
//               }),
//             },
//           });
//         }

//         // =====================================================
//         // D. REISSUE PAYMENT LOGIC
//         // =====================================================

//         if (targetStatus === "reissue") {
//           // ---------------------------------------------------
//           // NEW REISSUE
//           // ---------------------------------------------------

//           if (hasTravelDateChanged && inputCharge !== null && inputCharge > 0) {
//             const formattedDateStr = parsedTravelDate.toLocaleDateString(
//               "en-GB",
//               {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//                 timeZone: "Asia/Dhaka",
//               },
//             );

//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,

//                 amount: inputCharge,

//                 trxId: targetPnr,

//                 type: "debit",

//                 paymentDate: new Date(),

//                 paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,

//                 note: `Reissue Date Change Charge: PNR - ${targetPnr} (${formattedDateStr})`,
//               },
//             });
//           }

//           // ---------------------------------------------------
//           // EDIT LATEST REISSUE PAYMENT
//           // ---------------------------------------------------
//           else if (
//             !hasTravelDateChanged &&
//             isChargeInputted &&
//             inputCharge !== null
//           ) {
//             if (latestReissuePayment) {
//               await tx.payment.update({
//                 where: {
//                   id: latestReissuePayment.id,
//                 },

//                 data: {
//                   amount: inputCharge,

//                   clientId: targetClientId,

//                   trxId: targetPnr,
//                 },
//               });
//             }
//           }
//         }

//         // =====================================================
//         // E. REFUND / VOID PAYMENT
//         // =====================================================

//         if (
//           isStatusChanged &&
//           (targetStatus === "refund" || targetStatus === "void")
//         ) {
//           const netRefundAmount = price - finalServiceCharge;

//           if (netRefundAmount > 0) {
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,

//                 amount: netRefundAmount,

//                 trxId: targetPnr,

//                 type: "credit",

//                 paymentDate: new Date(),

//                 paymentMethod: `${targetStatus.toUpperCase()} Return, PNR - ${targetPnr}`,

//                 note: `PNR - ${targetPnr} (${targetStatus.toUpperCase()} return amount after service charge: ${finalServiceCharge})`,
//               },
//             });
//           }
//         }

//         // =====================================================
//         // F. UPDATE TICKET
//         // =====================================================

//         const updated = await tx.ticket.update({
//           where: {
//             id,
//           },

//           data: {
//             pnrCode: targetPnr,
//             ticketType:
//               ticketType !== undefined &&
//               ticketType !== null &&
//               String(ticketType).trim() !== ""
//                 ? ticketType
//                 : oldTicket.ticketType,
//             issueDate:
//               parsedIssueDate !== null ? parsedIssueDate : oldTicket.issueDate,
//             passengerName:
//               passengerName !== undefined &&
//               passengerName !== null &&
//               String(passengerName).trim() !== ""
//                 ? passengerName
//                 : oldTicket.passengerName,
//             route:
//               route !== undefined &&
//               route !== null &&
//               String(route).trim() !== ""
//                 ? route
//                 : oldTicket.route,
//             travelDate: formattedTravelDate,
//             totalPax:
//               totalPax !== undefined &&
//               totalPax !== null &&
//               String(totalPax).trim() !== ""
//                 ? String(totalPax)
//                 : String(oldTicket.totalPax || 1),
//             airline:
//               airline !== undefined &&
//               airline !== null &&
//               String(airline).trim() !== ""
//                 ? airline
//                 : oldTicket.airline,
//             status: targetStatus,
//             netCost: cost,
//             clientPrice: price,
//             serviceCharge: finalServiceCharge,
//             netProfit: calculatedNetProfit,
//             issuedById: targetIssuedById,
//             clientId: targetClientId,
//           },
//         });

//         return updated;
//       },
//       {
//         maxWait: 10000,
//         timeout: 20000,
//       },
//     );

//     // =========================================================
//     // 15. SUCCESS RESPONSE
//     // =========================================================

//     return res.status(200).json({
//       message: `Ticket updated successfully (${updatedTicket.status})!`,

//       data: updatedTicket,
//     });
//   } catch (error) {
//     console.error("Update Ticket Error:", error);

//     return res.status(500).json({
//       message: "Failed to update ticket",

//       error: error.message,
//     });
//   }
// };

// ----------------------------------------------------
// 4. DELETE TICKET
// ----------------------------------------------------

// export const updateTicket = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       pnrCode,
//       ticketType,
//       issueDate,
//       passengerName,
//       route,
//       travelDate,
//       totalPax,
//       airline,
//       status,
//       netCost,
//       clientPrice,
//       serviceCharge,
//       issuedById,
//       clientId,
//     } = req.body;

//     // =========================================================
//     // 1. FIND OLD TICKET
//     // =========================================================

//     const oldTicket = await prisma.ticket.findUnique({
//       where: { id },
//     });

//     if (!oldTicket) {
//       return res.status(404).json({
//         message: "Ticket not found!",
//       });
//     }

//     // =========================================================
//     // 2. STATUS
//     // =========================================================

//     const targetStatus =
//       status !== undefined && status !== null && String(status).trim() !== ""
//         ? String(status).trim().toLowerCase()
//         : String(oldTicket.status).trim().toLowerCase();

//     const oldStatus = String(oldTicket.status).trim().toLowerCase();

//     const isStatusChanged = oldStatus !== targetStatus;

//     // Reissue / Refund / Void cannot go back to Issued
//     if (
//       isStatusChanged &&
//       targetStatus === "issued" &&
//       ["reissue", "refund", "void"].includes(oldStatus)
//     ) {
//       return res.status(400).json({
//         message:
//           "You can not change a reissue, refund, or void ticket back to issued!",
//       });
//     }

//     // =========================================================
//     // 3. PNR
//     // =========================================================

//     const targetPnr =
//       pnrCode !== undefined && pnrCode !== null && String(pnrCode).trim() !== ""
//         ? String(pnrCode).trim().toUpperCase()
//         : String(oldTicket.pnrCode).trim().toUpperCase();

//     const oldPnr = String(oldTicket.pnrCode).trim().toUpperCase();

//     if (!targetPnr) {
//       return res.status(400).json({
//         message: "PNR code is required!",
//       });
//     }

//     const isPnrChanged = oldPnr !== targetPnr;

//     // =========================================================
//     // 4. USER / CLIENT
//     // =========================================================

//     const targetIssuedById =
//       issuedById !== undefined &&
//       issuedById !== null &&
//       String(issuedById).trim() !== ""
//         ? issuedById
//         : oldTicket.issuedById;

//     const targetClientId =
//       clientId !== undefined &&
//       clientId !== null &&
//       String(clientId).trim() !== ""
//         ? clientId
//         : oldTicket.clientId;

//     const oldIssuedById = oldTicket.issuedById;

//     const oldClientId = oldTicket.clientId;

//     const isUserChanged = oldIssuedById !== targetIssuedById;

//     const isClientChanged = oldClientId !== targetClientId;

//     // =========================================================
//     // 5. TRAVEL DATE VALIDATION
//     // =========================================================

//     let parsedTravelDate = null;

//     if (
//       travelDate !== undefined &&
//       travelDate !== null &&
//       String(travelDate).trim() !== ""
//     ) {
//       parsedTravelDate = new Date(travelDate);

//       if (Number.isNaN(parsedTravelDate.getTime())) {
//         return res.status(400).json({
//           message: "Invalid travel date!",
//         });
//       }
//     }

//     const oldTravelDate = oldTicket.travelDate
//       ? new Date(oldTicket.travelDate)
//       : null;

//     if (oldTravelDate && Number.isNaN(oldTravelDate.getTime())) {
//       return res.status(500).json({
//         message: "Existing ticket has an invalid travel date!",
//       });
//     }

//     const isTravelDateChanged =
//       parsedTravelDate !== null &&
//       oldTravelDate !== null &&
//       parsedTravelDate.getTime() !== oldTravelDate.getTime();

//     const isTravelDateAdded =
//       parsedTravelDate !== null && oldTravelDate === null;

//     const hasTravelDateChanged = isTravelDateChanged || isTravelDateAdded;

//     // =========================================================
//     // 6. FIRST-TIME REISSUE
//     //
//     // issued -> reissue
//     // MUST change travel date
//     // =========================================================

//     if (
//       isStatusChanged &&
//       targetStatus === "reissue" &&
//       oldStatus !== "reissue" &&
//       !hasTravelDateChanged
//     ) {
//       return res.status(400).json({
//         message:
//           "Travel date must be changed for the first-time ticket reissue!",
//       });
//     }

//     // =========================================================
//     // 7. ISSUE DATE
//     // =========================================================

//     let parsedIssueDate = null;

//     if (
//       issueDate !== undefined &&
//       issueDate !== null &&
//       String(issueDate).trim() !== ""
//     ) {
//       parsedIssueDate = new Date(issueDate);

//       if (Number.isNaN(parsedIssueDate.getTime())) {
//         return res.status(400).json({
//           message: "Invalid issue date!",
//         });
//       }
//     }

//     // =========================================================
//     // 8. FINANCIAL VALUES
//     // =========================================================

//     const isChargeInputted =
//       serviceCharge !== undefined &&
//       serviceCharge !== null &&
//       String(serviceCharge).trim() !== "";

//     const inputCharge = isChargeInputted ? Number(serviceCharge) : null;

//     const oldCharge = Number(oldTicket.serviceCharge || 0);

//     const cost =
//       netCost !== undefined && netCost !== null && String(netCost).trim() !== ""
//         ? Number(netCost)
//         : Number(oldTicket.netCost || 0);

//     const price =
//       clientPrice !== undefined &&
//       clientPrice !== null &&
//       String(clientPrice).trim() !== ""
//         ? Number(clientPrice)
//         : Number(oldTicket.clientPrice || 0);

//     const oldNetProfit = Number(oldTicket.netProfit || 0);

//     const oldClientPrice = Number(oldTicket.clientPrice || 0);

//     const isPriceChanged = price !== oldClientPrice;

//     // =========================================================
//     // 9. NUMBER VALIDATION
//     // =========================================================

//     if (
//       !Number.isFinite(cost) ||
//       !Number.isFinite(price) ||
//       (inputCharge !== null && !Number.isFinite(inputCharge))
//     ) {
//       return res.status(400).json({
//         message: "Invalid financial amount!",
//       });
//     }

//     if (cost < 0) {
//       return res.status(400).json({
//         message: "Net cost cannot be negative!",
//       });
//     }

//     if (price < 0) {
//       return res.status(400).json({
//         message: "Client price cannot be negative!",
//       });
//     }

//     if (inputCharge !== null && inputCharge < 0) {
//       return res.status(400).json({
//         message: "Service charge cannot be negative!",
//       });
//     }

//     // =========================================================
//     // 10. INITIAL PROFIT CALCULATION
//     // =========================================================

//     let finalServiceCharge = oldCharge;

//     let calculatedNetProfit = oldNetProfit;

//     let latestReissuePayment = null;

//     // REFUND / VOID
//     if (targetStatus === "refund" || targetStatus === "void") {
//       finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;

//       calculatedNetProfit = finalServiceCharge;
//     }

//     // REISSUE
//     else if (targetStatus === "reissue") {
//       // First time / new reissue with date change
//       if (hasTravelDateChanged) {
//         finalServiceCharge =
//           oldCharge + (inputCharge !== null ? inputCharge : 0);
//       }

//       // Existing reissue without date change
//       // will be recalculated inside transaction
//       else if (isChargeInputted) {
//         finalServiceCharge = oldCharge;
//       }

//       calculatedNetProfit = price - cost + finalServiceCharge;
//     }

//     // NORMAL TICKET
//     else {
//       finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;

//       calculatedNetProfit = price - cost + finalServiceCharge;
//     }

//     // =========================================================
//     // 11. TRANSACTION
//     // =========================================================

//     const updatedTicket = await prisma.$transaction(
//       async (tx) => {
//         // =====================================================
//         // 11A. FIND LATEST REISSUE PAYMENT
//         //
//         // Important:
//         // If PNR changed, payment PNR is transferred first.
//         // So search using targetPnr.
//         // =====================================================

//         if (
//           targetStatus === "reissue" &&
//           !hasTravelDateChanged &&
//           isChargeInputted
//         ) {
//           latestReissuePayment = await tx.payment.findFirst({
//             where: {
//               trxId: targetPnr,
//               type: "debit",
//               paymentMethod: {
//                 contains: "REISSUE",
//                 mode: "insensitive",
//               },
//             },
//             orderBy: {
//               createdAt: "desc",
//             },
//           });

//           // Existing reissue charge edit
//           if (latestReissuePayment) {
//             finalServiceCharge =
//               oldCharge -
//               Number(latestReissuePayment.amount || 0) +
//               inputCharge;
//           }

//           // No existing reissue payment
//           else {
//             finalServiceCharge = inputCharge;
//           }

//           calculatedNetProfit = price - cost + finalServiceCharge;
//         }

//         // =====================================================
//         // 11B. PROFIT ADJUSTMENT
//         // =====================================================

//         const oldUserProfit = Math.max(oldNetProfit, 0);

//         const newUserProfit = Math.max(calculatedNetProfit, 0);

//         // const adjustUserProfit = async (userId, amount) => {
//         //   if (!userId || amount === 0) {
//         //     return;
//         //   }

//         //   if (amount > 0) {
//         //     await tx.user.update({
//         //       where: {
//         //         id: userId,
//         //       },
//         //       data: {
//         //         totalProfit: {
//         //           increment: amount,
//         //         },
//         //       },
//         //     });
//         //   } else {
//         //     await tx.user.update({
//         //       where: {
//         //         id: userId,
//         //       },
//         //       data: {
//         //         totalProfit: {
//         //           decrement: Math.abs(amount),
//         //         },
//         //       },
//         //     });
//         //   }
//         // };

//         // if (isUserChanged) {
//         //   // Remove old staff profit
//         //   if (oldIssuedById && oldUserProfit > 0) {
//         //     await adjustUserProfit(oldIssuedById, -oldUserProfit);
//         //   }

//         //   // Add new staff profit
//         //   if (targetIssuedById && newUserProfit > 0) {
//         //     await adjustUserProfit(targetIssuedById, newUserProfit);
//         //   }
//         // } else {
//         //   const profitDifference = newUserProfit - oldUserProfit;

//         //   if (targetIssuedById && profitDifference !== 0) {
//         //     await adjustUserProfit(targetIssuedById, profitDifference);
//         //   }
//         // }

//         // =====================================================
//         // 11C. PNR / CLIENT CHANGE
//         //
//         // Existing payment history moves with ticket
//         // =====================================================

//         if (isPnrChanged || isClientChanged) {
//           await tx.payment.updateMany({
//             where: {
//               trxId: oldPnr,
//             },
//             data: {
//               ...(isClientChanged && {
//                 clientId: targetClientId,
//               }),

//               ...(isPnrChanged && {
//                 trxId: targetPnr,
//               }),
//             },
//           });
//         }

//         // =====================================================
//         // 11D. CLIENT PRICE CHANGE
//         //
//         // Update ONLY original Ticket payment.
//         //
//         // Reissue payment:
//         //   paymentMethod contains REISSUE
//         //
//         // Refund/Void:
//         //   type = credit
//         //
//         // So only original Ticket debit is updated.
//         // =====================================================

//         if (isPriceChanged) {
//           await tx.payment.updateMany({
//             where: {
//               trxId: targetPnr,
//               type: "debit",
//               paymentMethod: {
//                 startsWith: "Ticket ",
//               },
//             },
//             data: {
//               amount: price,
//               clientId: targetClientId,
//             },
//           });
//         }

//         // =====================================================
//         // 11E. REISSUE PAYMENT
//         // =====================================================

//         if (targetStatus === "reissue") {
//           // -----------------------------------------------
//           // NEW REISSUE / DATE CHANGED
//           // -----------------------------------------------

//           if (hasTravelDateChanged && inputCharge !== null && inputCharge > 0) {
//             const formattedDateStr = parsedTravelDate.toLocaleDateString(
//               "en-GB",
//               {
//                 day: "2-digit",
//                 month: "short",
//                 year: "numeric",
//                 timeZone: "Asia/Dhaka",
//               },
//             );

//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,

//                 amount: inputCharge,

//                 trxId: targetPnr,

//                 type: "debit",

//                 paymentDate: new Date(),

//                 paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,

//                 note: `Reissue Date Change Charge: PNR - ${targetPnr} (${formattedDateStr})`,
//               },
//             });
//           }

//           // -----------------------------------------------
//           // EDIT EXISTING REISSUE CHARGE
//           // -----------------------------------------------
//           else if (
//             !hasTravelDateChanged &&
//             isChargeInputted &&
//             inputCharge !== null
//           ) {
//             if (latestReissuePayment) {
//               await tx.payment.update({
//                 where: {
//                   id: latestReissuePayment.id,
//                 },
//                 data: {
//                   amount: inputCharge,

//                   clientId: targetClientId,

//                   trxId: targetPnr,
//                 },
//               });
//             }
//           }
//         }

//         // =====================================================
//         // 11F. REFUND / VOID
//         // =====================================================

//         if (
//           isStatusChanged &&
//           (targetStatus === "refund" || targetStatus === "void")
//         ) {
//           const netRefundAmount = price - finalServiceCharge;

//           if (netRefundAmount > 0) {
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,

//                 amount: netRefundAmount,

//                 trxId: targetPnr,

//                 type: "credit",

//                 paymentDate: new Date(),

//                 paymentMethod: `${targetStatus.toUpperCase()} Return, PNR - ${targetPnr}`,

//                 note: `PNR - ${targetPnr} (${targetStatus.toUpperCase()} return amount after service charge: ${finalServiceCharge})`,
//               },
//             });
//           }
//         }

//         // =====================================================
//         // 11G. UPDATE TICKET
//         // =====================================================

//         const updated = await tx.ticket.update({
//           where: {
//             id,
//           },

//           data: {
//             pnrCode: targetPnr,

//             ticketType:
//               ticketType !== undefined &&
//               ticketType !== null &&
//               String(ticketType).trim() !== ""
//                 ? ticketType
//                 : oldTicket.ticketType,

//             issueDate:
//               parsedIssueDate !== null ? parsedIssueDate : oldTicket.issueDate,

//             passengerName:
//               passengerName !== undefined &&
//               passengerName !== null &&
//               String(passengerName).trim() !== ""
//                 ? passengerName
//                 : oldTicket.passengerName,

//             route:
//               route !== undefined &&
//               route !== null &&
//               String(route).trim() !== ""
//                 ? route
//                 : oldTicket.route,

//             travelDate:
//               parsedTravelDate !== null
//                 ? parsedTravelDate
//                 : oldTicket.travelDate,

//             totalPax:
//               totalPax !== undefined &&
//               totalPax !== null &&
//               String(totalPax).trim() !== ""
//                 ? String(totalPax)
//                 : String(oldTicket.totalPax || 1),

//             airline:
//               airline !== undefined &&
//               airline !== null &&
//               String(airline).trim() !== ""
//                 ? airline
//                 : oldTicket.airline,

//             status: targetStatus,

//             netCost: cost,

//             clientPrice: price,

//             serviceCharge: finalServiceCharge,

//             netProfit: calculatedNetProfit,

//             issuedById: targetIssuedById,

//             clientId: targetClientId,
//           },
//         });

//         return updated;
//       },
//       {
//         maxWait: 10000,
//         timeout: 20000,
//       },
//     );

//     // =========================================================
//     // 12. SUCCESS RESPONSE
//     // =========================================================

//     return res.status(200).json({
//       message: `Ticket updated successfully (${updatedTicket.status})!`,
//       data: updatedTicket,
//     });
//   } catch (error) {
//     console.error("Update Ticket Error:", error);

//     return res.status(500).json({
//       message: "Failed to update ticket",
//       error: error.message,
//     });
//   }
// };

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
      return res.status(404).json({
        message: "Ticket not found!",
      });
    }

    const hasValue = (value) =>
      value !== undefined && value !== null && String(value).trim() !== "";

    const oldStatus = String(oldTicket.status).trim().toLowerCase();

    const targetStatus = hasValue(status)
      ? String(status).trim().toLowerCase()
      : oldStatus;

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

    if (!targetPnr) {
      return res.status(400).json({
        message: "PNR code is required!",
      });
    }

    const isPnrChanged = oldPnr !== targetPnr;

    const targetIssuedById = hasValue(issuedById)
      ? issuedById
      : oldTicket.issuedById;

    const targetClientId = hasValue(clientId) ? clientId : oldTicket.clientId;

    const isClientChanged = oldTicket.clientId !== targetClientId;

    let parsedTravelDate = null;

    if (hasValue(travelDate)) {
      parsedTravelDate = new Date(travelDate);

      if (Number.isNaN(parsedTravelDate.getTime())) {
        return res.status(400).json({
          message: "Invalid travel date!",
        });
      }
    }

    const oldTravelDate = oldTicket.travelDate
      ? new Date(oldTicket.travelDate)
      : null;

    if (oldTravelDate && Number.isNaN(oldTravelDate.getTime())) {
      return res.status(500).json({
        message: "Existing ticket has an invalid travel date!",
      });
    }

    const hasTravelDateChanged =
      parsedTravelDate !== null &&
      (oldTravelDate === null ||
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

    let parsedIssueDate = null;

    if (hasValue(issueDate)) {
      parsedIssueDate = new Date(issueDate);

      if (Number.isNaN(parsedIssueDate.getTime())) {
        return res.status(400).json({
          message: "Invalid issue date!",
        });
      }
    }

    const isChargeInputted = hasValue(serviceCharge);
    const inputCharge = isChargeInputted ? Number(serviceCharge) : null;

    const oldCharge = Number(oldTicket.serviceCharge || 0);

    const cost = hasValue(netCost)
      ? Number(netCost)
      : Number(oldTicket.netCost || 0);

    const price = hasValue(clientPrice)
      ? Number(clientPrice)
      : Number(oldTicket.clientPrice || 0);

    const oldClientPrice = Number(oldTicket.clientPrice || 0);
    const isPriceChanged = price !== oldClientPrice;

    if (
      !Number.isFinite(cost) ||
      !Number.isFinite(price) ||
      (inputCharge !== null && !Number.isFinite(inputCharge))
    ) {
      return res.status(400).json({
        message: "Invalid financial amount!",
      });
    }

    if (cost < 0) {
      return res.status(400).json({
        message: "Net cost cannot be negative!",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Client price cannot be negative!",
      });
    }

    if (inputCharge !== null && inputCharge < 0) {
      return res.status(400).json({
        message: "Service charge cannot be negative!",
      });
    }

    let finalServiceCharge = oldCharge;
    let calculatedNetProfit = Number(oldTicket.netProfit || 0);
    let latestReissuePayment = null;

    if (["refund", "void"].includes(targetStatus)) {
      finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;
      calculatedNetProfit = finalServiceCharge;
    } else if (targetStatus === "reissue") {
      finalServiceCharge = hasTravelDateChanged
        ? oldCharge + (inputCharge || 0)
        : oldCharge;

      calculatedNetProfit = price - cost + finalServiceCharge;
    } else {
      finalServiceCharge = isChargeInputted ? inputCharge : oldCharge;
      calculatedNetProfit = price - cost + finalServiceCharge;
    }

    const updatedTicket = await prisma.$transaction(
      async (tx) => {
        // Existing reissue charge edit
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

        // Move old payment history if PNR/client changes
        if (isPnrChanged || isClientChanged) {
          await tx.payment.updateMany({
            where: {
              trxId: oldPnr,
            },
            data: {
              ...(isPnrChanged && { trxId: targetPnr }),
              ...(isClientChanged && { clientId: targetClientId }),
            },
          });
        }

        // গুরুত্বপূর্ণ:
        // Reissue অবস্থায় client price বদলালেও শুধু original ticket payment update হবে।
        // Reissue charge payment পরিবর্তন হবে না।
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

        // Create/update reissue charge payment
        if (targetStatus === "reissue") {
          if (hasTravelDateChanged && inputCharge !== null && inputCharge > 0) {
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
            !hasTravelDateChanged &&
            isChargeInputted &&
            latestReissuePayment
          ) {
            await tx.payment.update({
              where: {
                id: latestReissuePayment.id,
              },
              data: {
                amount: inputCharge,
                clientId: targetClientId,
                trxId: targetPnr,
              },
            });
          }
        }

        // Create refund/void return payment
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
            ticketType: hasValue(ticketType)
              ? ticketType
              : oldTicket.ticketType,
            issueDate: parsedIssueDate || oldTicket.issueDate,
            passengerName: hasValue(passengerName)
              ? passengerName
              : oldTicket.passengerName,
            route: hasValue(route) ? route : oldTicket.route,
            travelDate: parsedTravelDate || oldTicket.travelDate,
            totalPax: hasValue(totalPax)
              ? String(totalPax)
              : String(oldTicket.totalPax || 1),
            airline: hasValue(airline) ? airline : oldTicket.airline,
            status: targetStatus,
            netCost: cost,
            clientPrice: price,
            serviceCharge: finalServiceCharge,
            netProfit: calculatedNetProfit,
            issuedById: targetIssuedById,
            clientId: targetClientId,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    return res.status(200).json({
      message: `Ticket updated successfully (${updatedTicket.status})!`,
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Update Ticket Error:", error);

    return res.status(500).json({
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};
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
