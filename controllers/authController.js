import prisma from "../prisma/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    // Required Field Check (পাসওয়ার্ডসহ চেক করা হলো)
    if (!fullName || !phone || !email || !password || !role) {
      return res.status(400).json({
        message:
          "Full Name, Phone Number, Email, Password, and Role are required!",
      });
    }

    //  Email duplication check
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists!",
      });
    }

    //  Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User in Database
    const newUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        role,
        status: status ? status : "active",
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        monthlySalary: monthlySalary ? parseFloat(monthlySalary) : null,
        address: address || null,
      },
    });

    //Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "User created successfully!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required!",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password!",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is inactive. Please contact admin.",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid email or password!",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "1d" },
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Login successful!",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
