import { Router } from "express";
import * as managerController from "../controllers/manager.controller.js";

const router = Router();

router.route("/").get(managerController.getAllManagers).post(managerController.createManager);

router
	.route("/:id")
	.get(managerController.getManager)
	.patch(managerController.updateManager)
	.put(managerController.updateManager);

export default router;
