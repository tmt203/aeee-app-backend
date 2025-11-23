import { Router } from "express";
import { protect, restrictTo } from "../controllers/auth.controller.js";
import * as issueController from "../controllers/issue.controller.js";

const router = Router();

router.route("/:id").get(issueController.getIssue);
router.route("/").get(issueController.getAllIssues);

router.use(protect);
router.use(restrictTo("admin"));

router.post("/publish-issue", issueController.publishIssue);

router.route("/").post(issueController.createIssue);
router.route("/:id").put(issueController.updateIssue);

export default router;
