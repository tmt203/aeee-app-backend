import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import pageRouter from "./routes/page.route.js";
import announcementRouter from "./routes/announcement.route.js";
import articleRouter from "./routes/article.route.js";
import managerRouter from "./routes/manager.route.js";
import earlyAccessArticleRouter from "./routes/early_access_article.route.js";
import issueRouter from "./routes/issue.route.js";
import globalErrorHandler from "./utils/handlerGlobalError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start app
const app = express();
app.enable("trust proxy");

// Global middlewares
app.use(cors());
app.options("*", cors());
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(compression());

// Routes
app.use("/api/v1/pages", pageRouter);
app.use("/api/v1/announcements", announcementRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/managers", managerRouter);
app.use("/api/v1/early-access-articles", earlyAccessArticleRouter);
app.use("/api/v1/issues", issueRouter);

app.get("/", (req, res) => {
	res.json("Backend started successfully");
});

// Error Routes
app.all("*", (req, res, next) => {
	res.status(404).json({
		status: "error",
		message: `Can not find ${req.originalUrl} on this server`,
	});
});

app.use(globalErrorHandler);

export default app;
