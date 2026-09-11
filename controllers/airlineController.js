export const getAllAirlines = async (req, res) => {
  try {
    const airlines = await prisma.airline.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: airlines,
    });
  } catch (error) {
    console.error("Get Airlines Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get airlines",
    });
  }
};

// নতুন airline তৈরি
export const createAirline = async (req, res) => {
  try {
    const { code, name } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: "Airline code and name are required!",
      });
    }

    const airline = await prisma.airline.create({
      data: {
        code: String(code).trim().toUpperCase(),
        name: String(name).trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Airline created successfully!",
      data: airline,
    });
  } catch (error) {
    console.error("Create Airline Error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This airline code already exists!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create airline",
    });
  }
};

// airline update
export const updateAirline = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const oldAirline = await prisma.airline.findUnique({
      where: { id },
    });

    if (!oldAirline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found!",
      });
    }

    const airline = await prisma.airline.update({
      where: { id },
      data: {
        code: code ? String(code).trim().toUpperCase() : oldAirline.code,
        name: name ? String(name).trim() : oldAirline.name,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Airline updated successfully!",
      data: airline,
    });
  } catch (error) {
    console.error("Update Airline Error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This airline code already exists!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update airline",
    });
  }
};

// airline delete
export const deleteAirline = async (req, res) => {
  try {
    const { id } = req.params;

    const oldAirline = await prisma.airline.findUnique({
      where: { id },
    });

    if (!oldAirline) {
      return res.status(404).json({
        success: false,
        message: "Airline not found!",
      });
    }

    await prisma.airline.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Airline deleted successfully!",
    });
  } catch (error) {
    console.error("Delete Airline Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete airline",
    });
  }
};
