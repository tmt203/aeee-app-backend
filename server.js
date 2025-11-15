import chalk from "chalk";
import "dotenv/config.js";
import mongoose from "mongoose";
import app from "./src/app.js";

process.on("uncaughtException", (error) => {
	console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
	console.log(error.name, error.message);
	process.exit(1);
});

const DB = process.env.DATABASE_LOCAL;

mongoose
	.connect(DB)
	.then(() => {
		console.log("DB connection successful!");
	})
	.catch((error) => console.log(chalk.redBright(error)));

const PORT = process.env.PORT || 3000;
const SERVER = app.listen(PORT, () => {
	console.log(`App is running on port ${chalk.greenBright(PORT)}`);
});

process.on("unhandledRejection", (error) => {
	console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	console.log(error.name, error.message);

	SERVER.close(() => {
		process.exit(1);
	});
});

process.on("SIGTERM", () => {
	console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");

	SERVER.close(() => {
		console.log("💥 Process terminated!");
	});
});
