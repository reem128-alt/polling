const Question = require("../model/Question");
const Poll = require("../model/Poll");
const errorHandler = require("../middleware/error");

// Create a new question for a specific poll
const createQuestion = async (req, res, next) => {
  try {
    const { text, answers, pollId } = req.body;
    
    if (!text || !answers || !Array.isArray(answers) || answers.length === 0 || !pollId) {
      return next(errorHandler(400, "Please provide all required fields"));
    }
    
    // Check if poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    // Process answers to remove any problematic _id fields
    const processedAnswers = answers.map(answer => {
      // Remove _id field completely to let MongoDB generate proper ObjectIds
      const { _id, ...answerWithoutId } = answer;
      return answerWithoutId;
    });
    
    // Create the question
    const newQuestion = new Question({
      text,
      answers: processedAnswers,
      poll: pollId
    });
    
    const savedQuestion = await newQuestion.save();
    
    // Add the question to the poll's questions array
    await Poll.findByIdAndUpdate(
      pollId,
      { $push: { questions: savedQuestion } },
      { new: true }
    );
    
    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: savedQuestion
    });
  } catch (err) {
    next(err);
  }
};

// Get all questions for a specific poll
const getPollQuestions = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    
    // First, check if the poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    // Get questions from the Question collection
    const separateQuestions = await Question.find({ poll: pollId })
      .sort({ createdAt: -1 });
    
    // Get questions embedded in the poll document
    const embeddedQuestions = poll.questions || [];
    
    // Combine both sources of questions
    const allQuestions = [...embeddedQuestions, ...separateQuestions];
    
    res.status(200).json({
      success: true,
      count: allQuestions.length,
      questions: allQuestions
    });
  } catch (err) {
    next(err);
  }
};

// Get a single question by ID
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(errorHandler(400, "Invalid question ID format"));
    }
    
    // First try to find the question in the Question collection
    let question = await Question.findById(id);
      
    // If not found in Question collection, check if it's embedded in a Poll
    if (!question) {
      // Find a poll that contains a question with the given ID
      const poll = await Poll.findOne({ "questions._id": id });
      
      if (poll) {
        // Find the specific question in the poll's questions array
        question = poll.questions.find(q => q._id.toString() === id);
      }
    }
    
    if (!question) {
      return next(errorHandler(404, "Question not found"));
    }
    
    res.status(200).json({
      success: true,
      question
    });
  } catch (err) {
    next(err);
  }
};

// Update a question
const updateQuestion = async (req, res, next) => {
  try {
    const { text, answers } = req.body;
    const { id } = req.params;
    
    // First try to find and update in Question collection
    let question = await Question.findById(id);
    
    if (question) {
      // Update standalone question
      question = await Question.findByIdAndUpdate(
        id,
        { $set: { text, answers } },
        { new: true, runValidators: true }
      );
      
      // Also update the question in the poll if it exists there
      await Poll.updateOne(
        { _id: question.poll, "questions._id": question._id },
        { $set: { "questions.$": question } }
      );
    } else {
      // Check if it's an embedded question in a poll
      const poll = await Poll.findOne({ "questions._id": id });
      
      if (!poll) {
        return next(errorHandler(404, "Question not found"));
      }
      
      // Update the embedded question
      await Poll.updateOne(
        { "questions._id": id },
        { $set: { 
          "questions.$.text": text,
          "questions.$.answers": answers 
        }}
      );
      
      // Get the updated poll to return the updated question
      const updatedPoll = await Poll.findOne({ "questions._id": id });
      question = updatedPoll.questions.find(q => q._id.toString() === id);
    }
    
    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question
    });
  } catch (err) {
    console.error('Error in updateQuestion:', err);
    next(err);
  }
};

// Delete a question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First try to find in Question collection
    let question = await Question.findById(id);
    
    if (question) {
      // Remove standalone question from poll
      await Poll.findByIdAndUpdate(
        question.poll,
        { $pull: { questions: { _id: question._id } } }
      );
      
      // Delete the question
      await Question.findByIdAndDelete(id);
    } else {
      // Check if it's an embedded question in a poll
      const poll = await Poll.findOne({ "questions._id": id });
      
      if (!poll) {
        return next(errorHandler(404, "Question not found"));
      }
      
      // Remove the embedded question
      await Poll.updateOne(
        { _id: poll._id },
        { $pull: { questions: { _id: id } } }
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createQuestion,
  getPollQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion
};
