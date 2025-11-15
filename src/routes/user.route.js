import express from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, restrictTo, updatePassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.use(protect);

router.patch("/update-my-password", updatePassword);
router.get("/me", userController.getMe, userController.getUser);
router.patch("/update-me", userController.updateMe);
router.delete("/delete-me", userController.deleteMe);

router.use(restrictTo("admin"));

router.route("/").get(userController.getAllUsers);
router
	.route("/:id")
	.get(userController.getUser)
	.patch(userController.updateUser)
	.delete(userController.deleteUser);

export default router;
