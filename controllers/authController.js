import prisma from "../prisma/prisma.js";

// ১. নতুন User / Staff তৈরি করার API
export const createUser = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      role,
      status,
      joiningDate,
      monthlySalary,
      address,
    } = req.body;

    // Required Field Check
    if (!fullName || !phone || !role || !email) {
      return res.status(400).json({
        message:
          "Full Name, email, password, Phone Number, and Designation/Role are required!",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        password,
        email: email,
        role: role,
        status: status ? status : "active",
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null,
        address: address || null,
      },
    });

    res.status(201).json({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ২. সকল User-এর লিস্ট পাওয়ার API
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        phone: true,
        password: true,
        email: true,
        role: true,
        status: true,
        joiningDate: true,
        monthlySalary: true,
        address: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
