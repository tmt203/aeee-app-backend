import { Router } from "express";
import * as issueController from "../controllers/issue.controller.js";

const router = Router();

router.route("/").get(issueController.getAllIssues).post(issueController.createIssue);

router.route("/latest").get(issueController.getLatestIssue);

router.route("/:id").get(issueController.getIssue).put(issueController.updateIssue);

export default router;
