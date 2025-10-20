import { Router } from "express";
import * as pageController from "../controllers/page.controller.js";
import { skipXssForContent } from "../middlewares/skipXssContent.js";

const router = Router();

router.route("/").get(pageController.getAllPages).post(pageController.createPage);

router.put("/slug", skipXssForContent, pageController.updatePageBySlug);

router
	.route("/:id")
	.get(pageController.getPage)
	.patch(pageController.updatePage)
	.delete(pageController.deletePage);

export default router;
