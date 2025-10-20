import { Router } from "express";
import * as announcementController from "../controllers/announcement.controller.js";
import { skipXssForContent } from "../middlewares/skipXssContent.js";

const router = Router();

router
	.route("/")
	.get(announcementController.getAllAnnouncements)
	.post(announcementController.createAnnouncement);

router
	.route("/:id")
	.get(announcementController.getAnnouncement)
	.put(skipXssForContent, announcementController.updateAnnouncement)
	.delete(announcementController.deleteAnnouncement);

export default router;
