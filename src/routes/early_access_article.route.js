import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth.controller.js";
import * as earlyAccessArticleController from "../controllers/early_access_article.controller.js";

const router = Router();

router
	.route("/")
	.get(earlyAccessArticleController.getAllEarlyAccessArticles)
	.post(earlyAccessArticleController.createEarlyAccessArticle);

router.route("/:id").get(earlyAccessArticleController.getEarlyAccessArticle);

router.use(protect);
router.use(restrictTo("admin"));

router.post(
	"/upload-file",
	earlyAccessArticleController.uploadSingle,
	earlyAccessArticleController.uploadFile
);
router.delete("/delete-file", earlyAccessArticleController.deleteFile);

router
	.route("/:id")
	.put(earlyAccessArticleController.updateEarlyAccessArticle)
	.patch(earlyAccessArticleController.updateEarlyAccessArticle)
	.delete(earlyAccessArticleController.deleteEarlyAccessArticle);

export default router;
