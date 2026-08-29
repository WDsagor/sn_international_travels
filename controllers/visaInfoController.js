import { PrismaClient, Prisma } from "@prisma/client";
// import { Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// ১. নতুন VisaInfo তৈরি করা (Create)
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
    if (!issuedById || !clientId) {
      return res.status(400).json({
        message: "issuedById and clientId are required!",
      });
    }
    const netProfit = Number(clientPrice) - Number(netCost);
    // console.log(req.body);
    // console.log(submissionDate);
    const result = await prisma.$transaction(
      async (tx) => {
        const newVisaInfo = await prisma.visaInfo.create({
          data: {
            issueDate: new Date(issueDate),
            clientId,
            issuedById,
            passportName,
            passportNumber,
            numberOfPassport,
            passportImage,
            visaCategory,
            visaType,
            agencyName,
            submissionDate: new Date(submissionDate),
            visaCountry,
            visaDetails,
            status: status || "Submitted",
            netCost: parseFloat(netCost),
            clientPrice: parseFloat(clientPrice),
            netProfit,
          },
          // include: {
          //   client: true, // ক্লায়েন্টের বিস্তারিত ডাটা পেতে
          //   issuedBy: true, // ইস্যুকারীর বিস্তারিত ডাটা পেতে
          // },
        });
        await tx.payment.create({
          data: {
            clientId: clientId,
            amount: parseFloat(clientPrice),
            type: "debit",
            paymentMethod: ` ${visaCountry?.toUpperCase()} VISA ${status?.toUpperCase()}`,
            paymentDate: new Date(),
            note: ` Visa detail: ${visaType}. (${visaDetails})`,
          },
        });
        await tx.user.update({
          where: { id: issuedById },
          data: {
            totalProfit: { increment: netProfit },
          },
        });

        return newVisaInfo;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );
    // console.log(newVisaInfo);

    res.status(201).json({
      success: true,
      message: "VisaInfo successfully created",
      data: result,
    });
  } catch (error) {
    // console.log(error?.code);
    if (error?.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: " Already added this information",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create VisaInfo",
      error: error.message,
    });
  }
};

// ২. সব VisaInfo-এর তালিকা পাওয়া (Get All)
export const getAllVisaInfo = async (req, res) => {
  try {
    const { search, status } = req.query;
    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { passportNumber: { contains: search, mode: "insensitive" } },
        { passportName: { contains: search, mode: "insensitive" } },
        { visaCountry: { contains: search, mode: "insensitive" } },
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
    const visaInfos = await prisma.visaInfo.findMany({
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
      count: visaInfos.length,
      data: visaInfos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch VisaInfo list",
      error: error.message,
    });
  }
};

// ৩. নির্দিষ্ট একটি ID দিয়ে VisaInfo ডাটা বের করা (Get Single)
export const getVisaInfoById = async (req, res) => {
  try {
    const { id } = req.params;

    const visaInfo = await prisma.visaInfo.findUnique({
      where: { id },
      include: {
        client: true,
        issuedBy: true,
      },
    });

    if (!visaInfo) {
      return res.status(404).json({
        success: false,
        message: "VisaInfo not found",
      });
    }

    res.status(200).json({
      success: true,
      data: visaInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching VisaInfo details",
      error: error.message,
    });
  }
};

// ৪. VisaInfo আপডেট করা (Update)
export const updateVisaInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // তারিখ সংক্রান্ত ফিল্ড রূপান্তর
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (updateData.submissionDate)
      updateData.submissionDate = new Date(updateData.submissionDate);

    // পাসপোর্ট নম্বর Uppercase
    if (updateData.passportNumber) {
      updateData.passportNumber = updateData.passportNumber.toUpperCase();
    }

    // netCost বা clientPrice আপডেট হলে netProfit পুনরায় হিসাব করা
    if (
      updateData.netCost !== undefined ||
      updateData.clientPrice !== undefined
    ) {
      const existingRecord = await prisma.visaInfo.findUnique({
        where: { id },
      });
      if (!existingRecord) {
        return res
          .status(404)
          .json({ success: false, message: "VisaInfo not found" });
      }

      const cost =
        updateData.netCost !== undefined
          ? parseFloat(updateData.netCost)
          : existingRecord.netCost;
      const price =
        updateData.clientPrice !== undefined
          ? parseFloat(updateData.clientPrice)
          : existingRecord.clientPrice;

      updateData.netCost = cost;
      updateData.clientPrice = price;
      updateData.netProfit = price - cost;
    }

    const updatedVisaInfo = await prisma.visaInfo.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        issuedBy: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "VisaInfo updated successfully",
      data: updatedVisaInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update VisaInfo",
      error: error.message,
    });
  }
};

// ৫. VisaInfo ডিলিট করা (Delete)
export const deleteVisaInfo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.visaInfo.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "VisaInfo deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete VisaInfo",
      error: error.message,
    });
  }
};
