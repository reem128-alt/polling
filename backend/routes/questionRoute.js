const express = require("express");
const router = express.Router();
const questionController = require("../controller/questionController");


// Public routes
router.get("/poll/:pollId", questionController.getPollQuestions);
router.get("/:id", questionController.getQuestionById);

// Protected routes (require authentication)
router.post("/", questionController.createQuestion);
router.put("/:id",questionController.updateQuestion);
router.delete("/:id",questionController.deleteQuestion);

module.exports = router;
