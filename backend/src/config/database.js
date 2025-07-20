import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "angular_job_db",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL database with Sequelize");

    await sequelize.sync({ force: false });
    console.log("📊 Database synchronized");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database:", error);
  }
};

export { sequelize, connectDatabase, closeDatabase };
