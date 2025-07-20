import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message:
          "All fields are required: firstName, lastName, email, password",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    const { password: _, ...userResponse } = user.toJSON();
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    res.status(400).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        iat: Math.floor(Date.now() / 1000),
        jti: `${user.id}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      },
      process.env.JWT_SECRET || "your-secret-key",
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
        issuer: "angular-job-app",
        audience: "angular-job-users",
      }
    );

    const { password: _, ...userResponse } = user.toJSON();

    res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal server error during login",
    });
  }
};

export { createUser, loginUser };
