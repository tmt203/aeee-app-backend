import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth.controller.js";
import * as articleController from "../controllers/article.controller.js";

const router = Router();

router.route("/latest").get(articleController.getLatestArticles);
router.route("/").get(articleController.getAllArticles);
router.route("/:id").get(articleController.getArticle);

router.use(protect);
router.use(restrictTo("admin"));

router.post("/upload-file", articleController.uploadSingle, articleController.uploadFile);
router.delete("/delete-file", articleController.deleteFile);

router.route("/").post(articleController.createArticle);
router
	.route("/:id")
	.patch(articleController.updateArticle)
	.put(articleController.updateArticle)
	.delete(articleController.deleteArticle);

export default router;
