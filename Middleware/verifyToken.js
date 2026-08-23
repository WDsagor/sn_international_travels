import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized! No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // ১. টোকেন ভেরিফাই করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ২. ডেটাবেসে সত্যি ইউজারটি এখনও বিদ্যমান কি না তা চেক করা
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, // আপনার JWT Payload-এ ইউজার ID এর নাম অনুযায়ী (id / userId) চেক করুন
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists!" });
    }

    // ৩. ইউজার যদি Inactive থাকে তবে এক্সেস না দেওয়া (ঐচ্ছিক কিন্তু নিরাপদ)
    if (user.status === "Inactive") {
      return res
        .status(403)
        .json({ success: false, message: "Your account is inactive!" });
    }

    // ৪. সম্পূর্ণ ইউজার অবজেক্ট রিকোয়েস্টে সেট করে দেওয়া
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token!" });
  }
};
