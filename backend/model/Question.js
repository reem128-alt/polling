const mongoose = require("mongoose");

// Answer Schema (nested in Question)
const AnswerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true,
        default: 0
    }
});

// Question Schema
const QuestionSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },
        answers: [AnswerSchema],
        poll: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Poll",
            required: true
        },
      
    },
    { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
