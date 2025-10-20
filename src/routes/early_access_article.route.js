import { Router } from "express";
import * as earlyAccessArticleController from "../controllers/early_access_article.controller.js";

const router = Router();

router
	.route("/")
	.get(earlyAccessArticleController.getAllEarlyAccessArticles)
	.post(earlyAccessArticleController.createEarlyAccessArticle);

router
	.route("/:id")
	.get(earlyAccessArticleController.getEarlyAccessArticle)
	.put(earlyAccessArticleController.updateEarlyAccessArticle);

export default router;
