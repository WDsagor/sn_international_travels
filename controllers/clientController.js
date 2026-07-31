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
        tickets: {
          select: {
            clientPrice: true,
            serviceCharge: true,
            status: true,
          },
        },
        payments: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const clientsWithDue = clients.map((client) => {
      const totalTickets = client.tickets.reduce((sum, t) => {
        if (t.status === "Refunded" || t.status === "Voided") {
          return sum + (t.serviceCharge || 0);
        }
        return sum + ((t.clientPrice || 0) + (t.serviceCharge || 0));
      }, 0);

      const totalPayments = client.payments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0,
      );

      const currentDue =
        (client.openingBalance || 0) + totalTickets - totalPayments;

      const { tickets, payments, ...clientData } = client;

      return {
        ...clientData,
        currentDue,
      };
    });

    res.status(200).json(clientsWithDue);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    if (
      !id ||
      id === "undefined" ||
      id === "null" ||
      typeof id !== "string" ||
      id.trim() === ""
    ) {
      console.error("❌ Invalid ID received:", id);
      return res.status(400).json({
        success: false,
        message: "Valid Client UUID is required.",
      });
    }

    const cleanId = id.trim();

    // ২. Prisma Query
    const client = await prisma.client.findUnique({
      where: { id: cleanId },
      include: {
        tickets: {
          select: {
            id: true,
            pnrCode: true,
            passengerName: true,
            ticketType: true,
            clientPrice: true,
            serviceCharge: true,
            netCost: true,
            netProfit: true,
            status: true,
            issueDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            trxId: true,
            note: true,
            paymentDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Error fetching client ledger:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching client ledger.",
      error: error.message,
    });
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
