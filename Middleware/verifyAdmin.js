// Admin Role Verify করার Middleware
export const verifyAdmin = (req, res, next) => {
  try {
    // verifyToken থেকে প্রাপ্ত req.user চেক করা
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Token not verified." });
    }

    // Role 'admin' কিনা চেক করা (Small case & Capital case উভয়টাই হ্যান্ডেল করা হয়েছে)
    const role = req.user.role?.toLowerCase();

    // ৩. Role যদি 'admin' অথবা 'accounts' হয়, তবে পরের ধাপে যাবে
    if (role === "admin" || role === "accounts") {
      return next();
    }

    return res.status(403).json({
      message: "Forbidden! Access required.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error in authorization middleware." });
  }
};
