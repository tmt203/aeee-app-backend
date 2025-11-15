import express from "express";
import {
	signin,
	signup,
	logout,
	forgotPassword,
	resetPassword,
	verifyToken,
	protect,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", signin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/verify-token", protect, verifyToken);

export default router;
