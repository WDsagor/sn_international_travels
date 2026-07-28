import prisma from "../prisma/prisma.js";

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
    // console.log(req.body);
    // Required Field Check (CLIENT TYPE, FULL NAME, PHONE NUMBER)
    if (!clientType || !fullName || !phone) {
      return res.status(400).json({
        message: "Client Type, Full Name, and Phone Number are required!",
      });
    }

    // Phone Duplication Check
    const existingPhone = await prisma.client.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "A client with this phone number already exists!",
      });
    }

    // Email Duplication Check
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
    // Create Client in DB
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
    // console.log(newClient);
    res.status(201).json({
      message: "Client created successfully!",
      client: newClient,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAllClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
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
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found!" });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ২. Client ডিলিট করার API (Delete Client)
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // ক্লায়েন্ট আছে কিনা চেক করা
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return res.status(404).json({ message: "Client not found!" });
    }

    // DB থেকে ডিলিট করা
    await prisma.client.delete({
      where: { id },
    });

    res.status(200).json({ message: "Client deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
