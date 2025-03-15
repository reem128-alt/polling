const mongoose = require("mongoose");

// Schema for individual question answers
const QuestionResponseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Question"
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

// Poll Response Schema
const PollResponseSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Poll"
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    employment_status: {
      type: String,
      required: true
    },
    teaching: {
      type: String,
      required: true
    },
    date_of_birth: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female']
    },
    responses: [QuestionResponseSchema],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PollResponse", PollResponseSchema);
