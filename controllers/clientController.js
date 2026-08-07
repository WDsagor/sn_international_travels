import prisma from "../prisma/prisma.js";

// ----------------------------------------------------
// 1. CREATE CLIENT
// ----------------------------------------------------
export const createClient = async (req, res) => {
  try {
    const {
      clientType,
      fullName,
      phone,
      email,
      company,
      openingBalance,
      address,
      status,
    } = req.body;

    if (!clientType || !fullName || !phone) {
      return res.status(400).json({
        message: "Client Type, Full Name, and Phone Number are required!",
      });
    }

    const existingPhone = await prisma.client.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "A client with this phone number already exists!",
      });
    }

    if (email) {
      const existingEmail = await prisma.client.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "A client with this email already exists!",
        });
      }
    }

    const newClient = await prisma.client.create({
      data: {
        clientType: clientType || "Individual",
        fullName,
        phone,
        email: email || null,
        company: company || null,
        openingBalance: openingBalance ? parseFloat(openingBalance) : 0,
        address: address || null,
        status: status || "active",
      },
    });

    res.status(201).json({
      message: "Client created successfully!",
      client: newClient,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----------------------------------------------------
// 2. GET ALL CLIENTS (With Dynamic currentDue Calculation)
// ----------------------------------------------------

export const getAllClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        payments: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const clientsWithBalance = clients.map((client) => {
      // payments অ্যারে থেকে টাইপ অনুযায়ী Debit ও Credit হিসাব
      const { totalDebit, totalCredit } = client.payments.reduce(
        (acc, p) => {
          const amt = Number(p.amount || 0);
          const pType = (p.type || "").toLowerCase();

          if (pType === "debit") {
            acc.totalDebit += amt;
          } else if (pType === "credit") {
            acc.totalCredit += amt;
          }
          return acc;
        },
        { totalDebit: 0, totalCredit: 0 },
      );

      // Current Due = Opening Balance + Total Debit - Total Credit
      const currentDue =
        Number(client.openingBalance || 0) + totalDebit - totalCredit;

      const { payments, ...clientData } = client;

      return {
        ...clientData,
        totalDebit,
        totalCredit,
        currentDue, // এই মানটি আপনার সঠিক বকেয়া নির্দেশ করবে
      };
    });

    res.status(200).json({
      success: true,
      data: clientsWithBalance,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ----------------------------------------------------
// 3. UPDATE CLIENT
// ----------------------------------------------------
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientType,
      fullName,
      phone,
      email,
      company,
      openingBalance,
      address,
      status,
    } = req.body;

    const existingClient = await prisma.client.findUnique({ where: { id } });

    if (!existingClient) {
      return res.status(404).json({ message: "Client not found!" });
    }

    if (phone && phone !== existingClient.phone) {
      const phoneTaken = await prisma.client.findUnique({ where: { phone } });
      if (phoneTaken) {
        return res
          .status(400)
          .json({ message: "Phone number is already in use!" });
      }
    }

    if (email && email !== existingClient.email) {
      const emailTaken = await prisma.client.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(400).json({ message: "Email is already in use!" });
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(clientType && { clientType }),
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(company !== undefined && { company }),
        ...(openingBalance !== undefined && {
          openingBalance: parseFloat(openingBalance),
        }),
        ...(address !== undefined && { address }),
        ...(status && { status }),
      },
    });

    res.status(200).json({
      message: "Client updated successfully!",
      client: updatedClient,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ----------------------------------------------------
// 4. GET CLIENT BY ID & LEDGER
// ----------------------------------------------------

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: [{ paymentDate: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found!" });
    }

    let runningBalance = Number(client.openingBalance || 0);

    const ledger = client.payments.map((p) => {
      const amt = Number(p.amount || 0);
      const pType = (p.type || "").toLowerCase();

      const debit = pType === "debit" ? amt : 0;
      const credit = pType === "credit" ? amt : 0;

      // রানিং ব্যালেন্স এডজাস্টমেন্ট
      runningBalance = runningBalance + debit - credit;

      return {
        id: p.id,
        date: p.paymentDate || p.createdAt,
        details: p.paymentMethod,
        subDetails: p.note,
        debit,
        credit,
        runningBalance,
      };
    });

    const { payments, ...clientData } = client;

    res.status(200).json({
      success: true,
      data: {
        ...clientData,
        totalOutstandingDue: runningBalance,
        ledger,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ----------------------------------------------------
// 5. DELETE CLIENT
// ----------------------------------------------------
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({ message: "Client not found!" });
    }

    await prisma.client.delete({
      where: { id },
    });

    res.status(200).json({ message: "Client deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
