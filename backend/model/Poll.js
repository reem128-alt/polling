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

// Question Schema (nested in Poll)
const QuestionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    answers: [AnswerSchema]
});

// Poll Schema
const PollSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        questions: [QuestionSchema],
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Poll", PollSchema);
