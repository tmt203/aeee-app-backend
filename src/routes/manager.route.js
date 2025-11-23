import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth.controller.js";
import * as managerController from "../controllers/manager.controller.js";

const router = Router();

router.route("/").get(managerController.getAllManagers).post(managerController.createManager);
router.route("/:id").get(managerController.getManager);

router.use(protect);
router.use(restrictTo("admin"));

router.post("/upload-file", managerController.uploadSingle, managerController.uploadFile);
router.delete("/delete-file", managerController.deleteFile);

// router.post("/download-cross-reference", managerController.downloadCrossReference);

router
	.route("/:id")
	.patch(managerController.updateManager)
	.put(managerController.updateManager)
	.delete(managerController.deleteManager);

export default router;
