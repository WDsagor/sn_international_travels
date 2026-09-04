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

//     const oldTicket = await prisma.ticket.findUnique({
//       where: { id },
//     });

//     if (!oldTicket) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }

//     const charge = Number(serviceCharge) || 0;
//     const cost = Number(netCost) || 0;
//     const price = Number(clientPrice) || 0;
//     const currentTravelDate = `${travelDate}T00:00:00.000Z`;

//     console.log(oldTicket?.travelDate);

//     const oldCharge = Number(oldTicket?.serviceCharge) || 0;
//     const oldPrice = Number(oldTicket?.clientPrice) || 0;

//     let newNetProfit = 0;

//     if (charge > 0) {
//       newNetProfit = price - cost + charge;
//     } else {
//       newNetProfit = price - cost;
//     }

//     // const oldProfit = oldTicket.netProfit;
//     const targetIssuedById = issuedById;
//     const targetClientId = clientId;

//     const updatedTicket = await prisma.$transaction(
//       async (tx) => {
//         if (charge > 0) {
//           await tx.user.update({
//             where: { id: oldTicket.issuedById },
//             data: { totalProfit: { increment: charge } },
//           });
//         }

//         // ২. টিকিট আপডেট করা
//         const ticket = await tx.ticket.update({
//           where: { id },
//           data: {
//             pnrCode,
//             ticketType,
//             issueDate: new Date(issueDate),
//             passengerName,
//             route,
//             travelDate: currentTravelDate,
//             totalPax: String(totalPax || 1),
//             airline,
//             status,
//             netCost: cost,
//             clientPrice: price,
//             serviceCharge: charge,
//             netProfit: newNetProfit,
//             issuedById: targetIssuedById,
//             clientId: targetClientId,
//           },
//         });
//         if (
//           issuedById !== oldTicket?.issuedById ||
//           clientId !== oldTicket?.clientId
//         ) {
//           await tx.payment.updateMany({
//             where: {
//               trxId: {
//                 contains: oldTicket?.pnrCode,
//               },
//             },
//             data: {
//               clientId: targetClientId,
//             },
//           });
//           await tx.user.update({
//             where: { id: issuedById },
//             data: {
//               totalProfit: { decrement: oldTicket?.netProfit },
//             },
//           });
//         }
//         if (
//           currentTravelDate === new Date(oldTicket?.travelDate) &&
//           status.toUpperCase() === oldTicket?.status?.toUpperCase()
//         ) {
//           const oldPayment = await tx.payment.findFirst({
//             where: {
//               trxId: {
//                 contains: oldTicket?.pnrCode?.toUpperCase(),
//               },
//               clientId: oldTicket.clientId,
//               amount: oldPrice,
//             },
//           });
//           console.log(oldPayment);
//           if (oldPayment) {
//             await tx.payment.update({
//               where: { id: oldPayment?.id },
//               data: {
//                 amount: price,
//               },
//             });
//           }
//         } else {
//           const profitDiff = charge - oldCharge;
//           if (profitDiff > 0) {
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,
//                 amount: profitDiff,
//                 trxId: pnrCode?.toUpperCase(),
//                 type: "debit",
//                 paymentDate: new Date(),
//                 paymentMethod: `${status?.toUpperCase()} Charge, PNR - ${ticket?.pnrCode.toUpperCase()}`,
//                 note: `Reissue Charge: PNR - ${ticket?.pnrCode.toUpperCase()} (${ticket.route})`,
//               },
//             });
//           }
//         }
//         if (status === "refund" || status === "void") {
//           const netRefundAmount = oldTicket.clientPrice - charge;

//           if (netRefundAmount > 0) {
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,
//                 amount: netRefundAmount,
//                 trxId: pnrCode?.toUpperCase(),
//                 type: "credit",
//                 paymentMethod: `${status?.toUpperCase()} Return, PNR - ${ticket?.pnrCode.toUpperCase()}`,
//                 paymentDate: new Date(),
//                 note: `PNR - ${ticket?.pnrCode?.toUpperCase()}  (${status} after return amount. (${ticket.route})`,
//               },
//             });
//           }
//         }

//         return ticket;
//       },
//       {
//         maxWait: 10000,
//         timeout: 20000,
//       },
//     );

//     res.status(200).json({
//       message: `Ticket updated successfully (${status})!`,
//       data: updatedTicket,
//     });
//   } catch (error) {
//     console.error("Update Ticket Error:", error);
//     res.status(500).json({
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

//     // ১. আগের টিকিট ডাটাবেজ থেকে খুঁজে বের করা
//     const oldTicket = await prisma.ticket.findUnique({
//       where: { id },
//     });

//     if (!oldTicket) {
//       return res.status(404).json({ message: "Ticket not found!" });
//     }

//     // ভ্যালু কনভার্সন ও ফলব্যাক
//     const charge =
//       serviceCharge !== undefined
//         ? Number(serviceCharge)
//         : Number(oldTicket.serviceCharge || 0);
//     const oldCharge = Number(oldTicket.serviceCharge || 0);

//     const cost =
//       netCost !== undefined ? Number(netCost) : Number(oldTicket.netCost || 0);
//     const price =
//       clientPrice !== undefined
//         ? Number(clientPrice)
//         : Number(oldTicket.clientPrice || 0);
//     const oldPrice = Number(oldTicket.clientPrice || 0);

//     const targetPnr = (pnrCode || oldTicket.pnrCode).trim().toUpperCase();
//     const oldPnr = oldTicket.pnrCode.trim().toUpperCase();

//     const targetIssuedById = issuedById || oldTicket.issuedById;
//     const oldIssuedById = oldTicket.issuedById;

//     const targetClientId = clientId || oldTicket.clientId;
//     const oldClientId = oldTicket.clientId;

//     const targetStatus = (status || oldTicket.status).toLowerCase();
//     const oldStatus = oldTicket.status.toLowerCase();

//     const formattedTravelDate = travelDate
//       ? `${travelDate}T00:00:00.000Z`
//       : oldTicket.travelDate;

//     // Net Profit ক্যালকুলেশন
//     let newNetProfit = 0;
//     if (targetStatus === "refund" || targetStatus === "void") {
//       newNetProfit = charge;
//     } else {
//       newNetProfit = price - cost + charge;
//     }

//     const updatedTicket = await prisma.$transaction(
//       async (tx) => {
//         // =========================================================
//         // ১. USER PROFIT ADJUSTMENT & ISSUED BY / CLIENT CHANGE
//         // =========================================================
//         const isUserChanged = oldIssuedById !== targetIssuedById;
//         const isClientChanged = oldClientId !== targetClientId;

//         if (isUserChanged) {
//           // আগের ইউজারের অ্যাকাউন্ট থেকে আগের Profit বাদ যাবে
//           if (oldTicket.netProfit > 0) {
//             await tx.user.update({
//               where: { id: oldIssuedById },
//               data: { totalProfit: { decrement: oldTicket.netProfit } },
//             });
//           }
//           // নতুন ইউজারের অ্যাকাউন্টে নতুন Profit যোগ হবে
//           if (newNetProfit > 0) {
//             await tx.user.update({
//               where: { id: targetIssuedById },
//               data: { totalProfit: { increment: newNetProfit } },
//             });
//           }
//         } else {
//           // একই ইউজার হলে Profit-এর পার্থক্য হিসাব করে অ্যাডজাস্টমেন্ট
//           const profitDiff = newNetProfit - oldTicket.netProfit;
//           if (profitDiff !== 0) {
//             await tx.user.update({
//               where: { id: targetIssuedById },
//               data: {
//                 totalProfit:
//                   profitDiff > 0
//                     ? { increment: profitDiff }
//                     : { decrement: Math.abs(profitDiff) },
//               },
//             });
//           }
//         }

//         // ক্লায়েন্ট বা PNR পরিবর্তন হলে আগের পেমেন্ট রেকর্ডগুলো নতুন ক্লায়েন্টে ট্রান্সফার
//         const isPnrChanged = oldPnr !== targetPnr;
//         if (isPnrChanged || isClientChanged) {
//           await tx.payment.updateMany({
//             where: {
//               trxId: { contains: oldPnr },
//             },
//             data: {
//               ...(isClientChanged && { clientId: targetClientId }),
//               ...(isPnrChanged && { trxId: targetPnr }),
//             },
//           });
//         }

//         // =========================================================
//         // ২. REISSUE LOGIC (একাধিকবার রিইস্যু ও চার্জ আপডেট)
//         // =========================================================
//         const isStatusChanged = oldStatus !== targetStatus;
//         const isChargeChanged = oldCharge !== charge;

//         if (targetStatus === "reissue") {
//           if (!isStatusChanged && isChargeChanged) {
//             // স্ট্যাটাস আগেই Reissue ছিল এবং শুধু সার্ভিস চার্জ চেঞ্জ হয়েছে:
//             // সর্বশেষ Reissue চার্জ এন্ট্রি খুঁজে বের করে সেটি আপডেট করা হবে
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
//                 data: { amount: charge },
//               });
//             } else if (charge > 0) {
//               // আগের কোনো রেকর্ড না পাওয়া গেলে নতুন ডেবিট এন্ট্রি তৈরি হবে
//               await tx.payment.create({
//                 data: {
//                   clientId: targetClientId,
//                   amount: charge,
//                   trxId: targetPnr,
//                   type: "debit",
//                   paymentDate: new Date(),
//                   paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,
//                   note: `Reissue Charge Update: PNR - ${targetPnr} (${route || oldTicket.route})`,
//                 },
//               });
//             }
//           } else if (isStatusChanged && charge > 0) {
//             // নতুন করে স্ট্যাটাস Reissue হলে ডেবিট এন্ট্রি তৈরি হবে
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,
//                 amount: charge,
//                 trxId: targetPnr,
//                 type: "debit",
//                 paymentDate: new Date(),
//                 paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,
//                 note: `Reissue Charge: PNR - ${targetPnr} (${route || oldTicket.route})`,
//               },
//             });
//           }
//         }

//         // =========================================================
//         // ৩. ISSUED TICKET PRICE UPDATE
//         // =========================================================
//         if (
//           targetStatus === "issued" &&
//           !isStatusChanged &&
//           oldPrice !== price
//         ) {
//           const originalPayment = await tx.payment.findFirst({
//             where: {
//               trxId: { contains: targetPnr },
//               clientId: targetClientId,
//               amount: oldPrice,
//             },
//           });

//           if (originalPayment) {
//             await tx.payment.update({
//               where: { id: originalPayment.id },
//               data: { amount: price },
//             });
//           }
//         }

//         // =========================================================
//         // ৪. REFUND OR VOID LOGIC
//         // =========================================================
//         if (
//           isStatusChanged &&
//           (targetStatus === "refund" || targetStatus === "void")
//         ) {
//           // Client Price থেকে Service Charge বাদ দিয়ে ফেরতযোগ্য টাকা হিসেব করা
//           const netRefundAmount = price - charge;

//           if (netRefundAmount > 0) {
//             await tx.payment.create({
//               data: {
//                 clientId: targetClientId,
//                 amount: netRefundAmount,
//                 trxId: targetPnr,
//                 type: "credit",
//                 paymentMethod: `${targetStatus.toUpperCase()} Return, PNR - ${targetPnr}`,
//                 paymentDate: new Date(),
//                 note: `PNR - ${targetPnr} (${targetStatus.toUpperCase()} return `,
//               },
//             });
//           }
//         }

//         // =========================================================
//         // ৫. TICKET DATA UPDATE
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
//             status: targetStatus.toUpperCase(),
//             netCost: cost,
//             clientPrice: price,
//             serviceCharge: charge,
//             netProfit: newNetProfit,
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

    // ১. আগের টিকিট ডাটাবেজ থেকে খুঁজে বের করা
    const oldTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!oldTicket) {
      return res.status(404).json({ message: "Ticket not found!" });
    }

    // ভ্যালু কনভার্সন ও ফলব্যাক
    const charge =
      serviceCharge !== undefined
        ? Number(serviceCharge)
        : Number(oldTicket.serviceCharge || 0);
    const oldCharge = Number(oldTicket.serviceCharge || 0);

    const cost =
      netCost !== undefined ? Number(netCost) : Number(oldTicket.netCost || 0);
    const price =
      clientPrice !== undefined
        ? Number(clientPrice)
        : Number(oldTicket.clientPrice || 0);
    const oldPrice = Number(oldTicket.clientPrice || 0);
    const oldCost = Number(oldTicket.netCost || 0);
    const diffPrice = price - oldPrice;
    const diffCost = cost - oldCost;
    const diffProfit = diffPrice - diffCost;

    const targetPnr = (pnrCode || oldTicket.pnrCode).trim().toUpperCase();
    const oldPnr = oldTicket.pnrCode.trim().toUpperCase();

    const targetIssuedById = issuedById || oldTicket.issuedById;
    const oldIssuedById = oldTicket.issuedById;

    const targetClientId = clientId || oldTicket.clientId;
    const oldClientId = oldTicket.clientId;

    const targetStatus = (status || oldTicket.status).toLowerCase();
    const oldStatus = oldTicket.status.toLowerCase();

    const formattedTravelDate = travelDate
      ? new Date(travelDate).toISOString()
      : oldTicket.travelDate;

    const isStatusChanged = oldStatus !== targetStatus;
    const isUserChanged = oldIssuedById !== targetIssuedById;
    const isClientChanged = oldClientId !== targetClientId;
    const isPnrChanged = oldPnr !== targetPnr;
    const isChargeChanged = oldCharge !== charge;
    const isTravelDateChanged =
      travelDate &&
      new Date(travelDate).toISOString() !==
        new Date(oldTicket.travelDate).toISOString();

    // Net Profit ক্যালকুলেশন
    let newNetProfit = 0;
    if (targetStatus === "refund" || targetStatus === "void") {
      // Refund বা Void হলে আগের প্রফিটের সাথে নতুন সার্ভিস চার্জ অতিরিক্ত প্রফিট হিসেবে যুক্ত হবে
      newNetProfit = Number(oldTicket.netProfit || 0) + charge;
    } else {
      newNetProfit = price - cost + charge;
    }

    const updatedTicket = await prisma.$transaction(
      async (tx) => {
        // =========================================================
        // ১. USER PROFIT ADJUSTMENT & ISSUED BY / CLIENT CHANGE
        // =========================================================
        if (isUserChanged) {
          // ইউজার চেঞ্জ হলে আগের ইউজারের অ্যাকাউন্ট থেকে আগের প্রফিট বাদ যাবে
          if (oldTicket.netProfit > 0) {
            await tx.user.update({
              where: { id: oldIssuedById },
              data: { totalProfit: { decrement: Number(oldTicket.netProfit) } },
            });
          }
          // নতুন ইউজারের অ্যাকাউন্টে মোট প্রফিট যোগ হবে
          if (newNetProfit > 0) {
            await tx.user.update({
              where: { id: targetIssuedById },
              data: { totalProfit: { increment: newNetProfit } },
            });
          }
        } else {
          // একই ইউজার হলে:
          if (targetStatus === "refund" || targetStatus === "void") {
            // Refund বা Void হলে সার্ভিস চার্জের টাকা সরাসরি ইউজারের ব্যালেন্সে যোগ (Increment) হবে
            if (charge > 0) {
              await tx.user.update({
                where: { id: targetIssuedById },
                data: { totalProfit: { increment: charge } },
              });
            }
          } else {
            // অন্যান্য স্ট্যাটাসের ক্ষেত্রে প্রফিটের পার্থক্য হিসাব হবে
            const profitDiff = newNetProfit - Number(oldTicket.netProfit || 0);
            if (profitDiff !== 0) {
              await tx.user.update({
                where: { id: targetIssuedById },
                data: {
                  totalProfit:
                    profitDiff > 0
                      ? { increment: profitDiff }
                      : { decrement: Math.abs(profitDiff) },
                },
              });
            }
          }
        }

        // ক্লায়েন্ট বা PNR পরিবর্তন হলে আগের পেমেন্ট রেকর্ডগুলো নতুন ক্লায়েন্টে ট্রান্সফার
        if (isPnrChanged || isClientChanged) {
          await tx.payment.updateMany({
            where: {
              trxId: { contains: oldPnr },
            },
            data: {
              ...(isClientChanged && { clientId: targetClientId }),
              ...(isPnrChanged && { trxId: targetPnr }),
            },
          });
        }

        // =========================================================
        // ২. REISSUE LOGIC (একাধিকবার রিইস্যু ও চার্জ আপডেট)
        // =========================================================
        if (targetStatus === "reissue") {
          // ১. ভ্রমণের তারিখ পরিবর্তন হলে নতুন Reissue Debit Entry ও Ticket Increment
          if (!isStatusChanged && isTravelDateChanged && charge > 0) {
            const formattedDateStr = new Date(travelDate)
              .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "Asia/Dhaka",
              })
              .replace(/^(\d{2})\s(\w{3})\s/, "$1 $2, ");

            await tx.payment.create({
              data: {
                clientId: targetClientId,
                amount: charge,
                trxId: targetPnr,
                type: "debit",
                paymentDate: new Date(),
                paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,
                note: `Reissue Date Change Charge: PNR - ${targetPnr} (${formattedDateStr})`,
              },
            });

            await tx.ticket.update({
              where: { id },
              data: {
                serviceCharge: { increment: charge },
                netProfit: { increment: charge },
              },
            });
          }

          // ২. তারিখ পরিবর্তন হয়নি কিন্তু সার্ভিস চার্জ আপডেট করা হয়েছে
          if (!isStatusChanged && !isTravelDateChanged && isChargeChanged) {
            const latestReissuePayment = await tx.payment.findFirst({
              where: {
                trxId: { contains: targetPnr },
                paymentMethod: { contains: "REISSUE", mode: "insensitive" },
              },
              orderBy: { createdAt: "desc" },
            });

            if (latestReissuePayment) {
              // আগের পেমেন্ট আপডেট
              await tx.payment.update({
                where: { id: latestReissuePayment.id },
                data: { amount: charge },
              });

              // পার্থক্যের ভিত্তিতে টিকিটের চার্জ ইনক্রিমেন্ট/ডিক্রিমেন্ট
              const diffCharge = charge - oldCharge;
              if (diffCharge !== 0) {
                const isIncrement = diffCharge > 0;
                const absDiff = Math.abs(diffCharge);

                await tx.ticket.update({
                  where: { id },
                  data: {
                    serviceCharge: isIncrement
                      ? { increment: absDiff }
                      : { decrement: absDiff },
                    netProfit: isIncrement
                      ? { increment: absDiff }
                      : { decrement: absDiff },
                  },
                });
              }
            } else if (charge > 0) {
              // আগের কোনো রেকর্ড না থাকলে নতুন এন্ট্রি তৈরি
              await tx.payment.create({
                data: {
                  clientId: targetClientId,
                  amount: charge,
                  trxId: targetPnr,
                  type: "debit",
                  paymentDate: new Date(),
                  paymentMethod: `REISSUE Charge, PNR - ${targetPnr}`,
                  note: `Reissue Charge Update: PNR - ${targetPnr} (${route || oldTicket.route})`,
                },
              });

              await tx.ticket.update({
                where: { id },
                data: {
                  serviceCharge: { increment: charge },
                  netProfit: { increment: charge },
                },
              });
            }
          }
        }

        // =========================================================
        // ৩. ISSUED TICKET PRICE UPDATE
        // =========================================================
        if (oldPrice !== price) {
          const oldPayment = await tx.payment.findFirst({
            where: {
              trxId: {
                contains: oldPnr.toUpperCase(),
              },
              clientId: targetClientId,
              amount: oldPrice,
            },
          });
          // console.log(oldPayment);
          if (oldPayment) {
            await tx.payment.update({
              where: { id: oldPayment?.id },
              data: {
                amount: price,
              },
            });
          }
        }

        // =========================================================
        // ৪. REFUND OR VOID LOGIC
        // =========================================================
        if (
          isStatusChanged &&
          (targetStatus === "refund" || targetStatus === "void")
        ) {
          // Client Price থেকে Service Charge বাদ দিয়ে বাকি রিফান্ড যোগ্য টাকা হিসেব
          const netRefundAmount = price - charge;

          if (netRefundAmount > 0) {
            await tx.ticket.update({
              where: { id },
              data: {
                // serviceCharge: { increment: netRefundAmount },
                netProfit: { increment: netRefundAmount },
              },
            });
            await tx.payment.create({
              data: {
                clientId: targetClientId,
                amount: netRefundAmount,
                trxId: targetPnr,
                type: "credit",
                paymentMethod: `${targetStatus.toUpperCase()} Return, PNR - ${targetPnr}`,
                paymentDate: new Date(),
                note: `PNR - ${targetPnr} (${targetStatus.toUpperCase()} return amount after service charge: ${charge}. Route: ${route || oldTicket.route})`,
              },
            });
          }
        }

        // =========================================================
        // ৫. TICKET DATA UPDATE
        // =========================================================
        const updated = await tx.ticket.update({
          where: { id },
          data: {
            pnrCode: targetPnr,
            ticketType: ticketType || oldTicket.ticketType,
            issueDate: issueDate ? new Date(issueDate) : oldTicket.issueDate,
            passengerName: passengerName || oldTicket.passengerName,
            route: route || oldTicket.route,
            travelDate: formattedTravelDate,
            totalPax: String(totalPax || oldTicket.totalPax || 1),
            airline: airline || oldTicket.airline,
            status: targetStatus,
            netCost: cost,
            clientPrice: price,

            netProfit:
              diffProfit > 0
                ? { increment: diffProfit }
                : { decrement: Math.abs(diffProfit) },

            issuedById: targetIssuedById,
            clientId: targetClientId,
          },
        });

        return updated;
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
