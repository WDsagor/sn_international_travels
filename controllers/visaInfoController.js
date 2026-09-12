import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const hasValue = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const parseDate = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const visaInclude = {
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
};

// CREATE VISA
export const createVisaInfo = async (req, res) => {
  try {
    const {
      issueDate,
      clientId,
      issuedById,
      passportName,
      passportNumber,
      numberOfPassport,
      passportImage,
      visaCategory,
      visaType,
      agencyName,
      submissionDate,
      visaCountry,
      visaDetails,
      status,
      netCost,
      clientPrice,
    } = req.body;

    if (
      !issueDate ||
      !clientId ||
      !issuedById ||
      !passportName ||
      !passportNumber ||
      !visaCategory ||
      !visaType ||
      !submissionDate ||
      !visaCountry
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided!",
      });
    }

    const parsedIssueDate = parseDate(issueDate);
    const parsedSubmissionDate = parseDate(submissionDate);

    if (!parsedIssueDate || !parsedSubmissionDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue date or submission date!",
      });
    }

    const cost = Number(netCost);
    const price = Number(clientPrice);

    if (
      !Number.isFinite(cost) ||
      !Number.isFinite(price) ||
      cost < 0 ||
      price < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid net cost or client price!",
      });
    }

    const targetPassportNumber = String(passportNumber).trim().toUpperCase();

    const targetCountry = String(visaCountry).trim().toUpperCase();
    const targetStatus = String(status || "Submitted").trim();
    const netProfit = price - cost;

    const visaInfo = await prisma.$transaction(async (tx) => {
      const createdVisa = await tx.visaInfo.create({
        data: {
          issueDate: parsedIssueDate,
          passportName: String(passportName).trim(),
          passportNumber: targetPassportNumber,
          numberOfPassport: hasValue(numberOfPassport)
            ? Number(numberOfPassport)
            : null,
          passportImage: passportImage || null,
          visaCategory: String(visaCategory).trim(),
          visaType: String(visaType).trim(),
          agencyName: agencyName || null,
          submissionDate: parsedSubmissionDate,
          visaCountry: targetCountry,
          visaDetails: visaDetails || null,
          status: targetStatus,
          netCost: cost,
          clientPrice: price,
          netProfit,

          issuedBy: {
            connect: { id: issuedById },
          },

          client: {
            connect: { id: clientId },
          },
        },
        include: visaInclude,
      });

      await tx.payment.create({
        data: {
          clientId,
          amount: price,
          trxId: targetPassportNumber,
          type: "debit",
          paymentDate: new Date(),
          paymentMethod: `Visa ${targetStatus.toUpperCase()}, Passport - ${targetPassportNumber}`,
          note: `Visa detail: ${targetVisaType}. (${targetCountry.toUpperCase()}, ${targetVisaDetails})`,
        },
      });

      return createdVisa;
    });

    return res.status(201).json({
      success: true,
      message: "Visa created successfully!",
      data: visaInfo,
    });
  } catch (error) {
    console.error("Create Visa Error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This visa information already exists!",
      });
    }

    if (error.code === "P2025") {
      return res.status(400).json({
        success: false,
        message: "Selected client or issuer was not found!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create visa",
      error: error.message,
    });
  }
};

// GET ALL VISA
export const getAllVisaInfo = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (hasValue(search)) {
      const keyword = String(search).trim();

      where.OR = [
        {
          passportNumber: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          passportName: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          visaCountry: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          client: {
            is: {
              fullName: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    if (hasValue(status) && status !== "All Status") {
      where.status = {
        equals: String(status).trim(),
        mode: "insensitive",
      };
    }

    const visaInfos = await prisma.visaInfo.findMany({
      where,
      include: visaInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: visaInfos.length,
      data: visaInfos,
    });
  } catch (error) {
    console.error("Get Visa Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch visa list",
      error: error.message,
    });
  }
};

// UPDATE VISA
export const updateVisaInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const oldVisa = await prisma.visaInfo.findUnique({
      where: { id },
    });
    // console.log(oldVisa);
    if (!oldVisa) {
      return res.status(404).json({
        success: false,
        message: "Visa information not found!",
      });
    }

    const {
      issueDate,
      clientId,
      issuedById,
      passportName,
      passportNumber,
      numberOfPassport,
      passportImage,
      visaCategory,
      visaType,
      agencyName,
      submissionDate,
      visaCountry,
      visaDetails,
      status,
      netCost,
      clientPrice,
    } = req.body;

    const targetIssueDate = hasValue(issueDate)
      ? parseDate(issueDate)
      : oldVisa.issueDate;

    const targetSubmissionDate = hasValue(submissionDate)
      ? parseDate(submissionDate)
      : oldVisa.submissionDate;

    if (!targetIssueDate || !targetSubmissionDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue date or submission date!",
      });
    }

    const targetCost = hasValue(netCost) ? Number(netCost) : oldVisa.netCost;

    const targetPrice = hasValue(clientPrice)
      ? Number(clientPrice)
      : oldVisa.clientPrice;

    if (
      !Number.isFinite(targetCost) ||
      !Number.isFinite(targetPrice) ||
      targetCost < 0 ||
      targetPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid net cost or client price!",
      });
    }

    const targetPassportNumber = hasValue(passportNumber)
      ? String(passportNumber).trim().toUpperCase()
      : oldVisa.passportNumber;

    const targetClientId = hasValue(clientId) ? clientId : oldVisa.clientId;

    const targetIssuedById = hasValue(issuedById)
      ? issuedById
      : oldVisa.issuedById;

    const targetStatus = hasValue(status)
      ? String(status).trim()
      : oldVisa.status;
    const targetCountry = hasValue(visaCountry)
      ? String(visaCountry).trim().toUpperCase()
      : oldVisa.visaCountry;
    const targetVisaType = hasValue(visaType)
      ? String(visaType).trim()
      : oldVisa.visaType;

    const targetVisaDetails = hasValue(visaDetails)
      ? visaDetails
      : oldVisa.visaDetails;

    const isPassportChanged = targetPassportNumber !== oldVisa.passportNumber;

    const isClientChanged = targetClientId !== oldVisa.clientId;

    const updatedVisa = await prisma.$transaction(async (tx) => {
      const visaInfo = await tx.visaInfo.update({
        where: { id },
        data: {
          issueDate: targetIssueDate,
          passportName: hasValue(passportName)
            ? String(passportName).trim()
            : oldVisa.passportName,

          passportNumber: targetPassportNumber,

          numberOfPassport: hasValue(numberOfPassport)
            ? Number(numberOfPassport)
            : oldVisa.numberOfPassport,

          passportImage: hasValue(passportImage)
            ? passportImage
            : oldVisa.passportImage,

          visaCategory: hasValue(visaCategory)
            ? String(visaCategory).trim()
            : oldVisa.visaCategory,

          visaType: targetVisaType,

          agencyName: hasValue(agencyName) ? agencyName : oldVisa.agencyName,

          submissionDate: targetSubmissionDate,

          visaCountry: targetCountry,

          visaDetails: targetVisaDetails,
          status: targetStatus,
          netCost: targetCost,
          clientPrice: targetPrice,
          netProfit: targetPrice - targetCost,

          ...(targetClientId !== oldVisa.clientId && {
            client: {
              connect: { id: targetClientId },
            },
          }),

          ...(targetIssuedById !== oldVisa.issuedById && {
            issuedBy: {
              connect: { id: targetIssuedById },
            },
          }),
        },
        include: visaInclude,
      });

      // Passport number অথবা client change হলে সব payment history update হবে
      if (isPassportChanged || isClientChanged) {
        await tx.payment.updateMany({
          where: {
            trxId: oldVisa.passportNumber,
            note: { contains: `(${oldVisa.visaCountry.toUpperCase()},` },
          },
          data: {
            trxId: targetPassportNumber,
            clientId: targetClientId,
          },
        });
      }

      // মূল Visa debit payment-এর amount/details update হবে
      await tx.payment.updateMany({
        where: {
          trxId: targetPassportNumber,
          type: "debit",
          paymentMethod: {
            startsWith: "Visa ",
          },
          note: { contains: `(${oldVisa.visaCountry.toUpperCase()},` },
        },
        data: {
          amount: targetPrice,
          clientId: targetClientId,
          paymentMethod: `Visa ${targetStatus.toUpperCase()}, Passport - ${targetPassportNumber}`,
          note: `Visa detail: ${targetVisaType}. (${targetCountry.toUpperCase()}, ${targetVisaDetails})
          })`,
        },
      });

      return visaInfo;
    });

    return res.status(200).json({
      success: true,
      message: "Visa updated successfully!",
      data: updatedVisa,
    });
  } catch (error) {
    console.error("Update Visa Error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This visa information already exists!",
      });
    }

    if (error.code === "P2025") {
      return res.status(400).json({
        success: false,
        message: "Selected client or issuer was not found!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update visa",
      error: error.message,
    });
  }
};

// DELETE VISA + PAYMENT HISTORY
export const deleteVisaInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const visaInfo = await prisma.visaInfo.findUnique({
      where: { id },
      select: {
        id: true,
        passportNumber: true,
      },
    });

    if (!visaInfo) {
      return res.status(404).json({
        success: false,
        message: "Visa information not found!",
      });
    }

    const deletedPaymentCount = await prisma.$transaction(async (tx) => {
      const deletedPayments = await tx.payment.deleteMany({
        where: {
          trxId: visaInfo.passportNumber,
        },
      });

      await tx.visaInfo.delete({
        where: { id },
      });

      return deletedPayments.count;
    });

    return res.status(200).json({
      success: true,
      message: "Visa and payment history deleted successfully!",
      deletedPayments: deletedPaymentCount,
    });
  } catch (error) {
    console.error("Delete Visa Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete visa",
      error: error.message,
    });
  }
};
