import { Router } from "express";
import * as articleController from "../controllers/article.controller.js";

const router = Router();

router.route("/").get(articleController.getAllArticles).post(articleController.createArticle);

router.route("/latest").get(articleController.getLatestArticles);

router
	.route("/:id")
	.get(articleController.getArticle)
	.patch(articleController.updateArticle)
	.put(articleController.updateArticle);

export default router;
