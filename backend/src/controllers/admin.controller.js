import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res, next) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const search = req.query.search || "";

  const category = req.query.category || "";

  const pipeline = [];

  pipeline.push({
    $match: {
      ...(search && {
        email: {
          $regex: search,

          $options: "i",
        },
      }),

      ...(category && {
        role: category,
      }),
    },
  });

  pipeline.push({
    $group: {
      _id: "$_id",
      name: {
        $first: "$name",
      },
      email: {
        $first: "$email",
      },
      role: {
        $first: "$role",
      },
      createdAt: {
        $first: "$createdAt",
      },
    },
  });

  pipeline.push({
    $sort: {
      email: 1,
    },
  });

  pipeline.push({
    $facet: {
      users: [
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ],
      total: [{ $count: "count" }],
    },
  });

  try {
    const [
      result,
      totalUser,
      totalAdmin,
      totalSupplier,
      totalEmployee,
      totalCustomer,
    ] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "supplier" }),
      User.countDocuments({ role: "employee" }),
      User.countDocuments({ role: "customer" }),
    ]);
    if (!result) {
      throw new ApiError(404, "No users found");
    }
    const users = result[0].users;
    const total = result[0].total[0]?.count || 0;
    const totalPages = Math.ceil((result[0].total[0]?.count || 0) / limit);
    const response = {
      users,
      total,
      totalUser,
      totalAdmin,
      totalSupplier,
      totalEmployee,
      totalCustomer,
      page,
      totalPages,
    };
    res.send(response);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password?.trim()) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
