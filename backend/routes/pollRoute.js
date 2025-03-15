const express = require("express");
const router = express.Router();
const pollController = require("../controller/pollController");


// Public routes
router.get("/",  pollController.getAllPolls);
router.get("/:id", pollController.getPollById);
router.post("/solve", pollController.solvePoll);
router.get("/responses/:pollId", pollController.getPollResponses);

// Protected routes (require authentication)
router.post("/", pollController.createPoll);
router.put("/:id", pollController.updatePoll);
router.delete("/:id", pollController.deletePoll);



module.exports = router;
