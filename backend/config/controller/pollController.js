const Poll = require("../model/Poll");
const errorHandler = require("../middleware/error");
const PollResponse = require("../model/PollResponse");

// Create a new poll
const createPoll = async (req, res, next) => {
  try {
    const { title, description, questions } = req.body;
    
    if (!title || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
      return next(errorHandler(400, "Please provide all required fields"));
    }
    
    // Add creator if user is authenticated
    const newPoll = new Poll(
      req.body
    );
    
    const savedPoll = await newPoll.save();
    res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: savedPoll
    });
  } catch (err) {
    next(err);
  }
};

// Get all polls
const getAllPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find()
      .sort({ createdAt: -1 }) // Sort by newest first
     
    res.status(200).json({
      success: true,
      count: polls.length,
      polls
    });
  } catch (err) {
    next(err);
  }
};

// Get a single poll by ID
const getPollById = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id)
       
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    res.status(200).json({
      success: true,
      poll
    });
  } catch (err) {
    next(err);
  }
};

// Update a poll
const updatePoll = async (req, res, next) => {
  try {
    let poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    // Check if user is the creator or an admin
   // if (req.user && (poll.creator.toString() === req.user.id || req.user.admin)) 
    poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Poll updated successfully",
      poll
    });
    
  } catch (err) {
    next(err);
  }
};

// Delete a poll
const deletePoll = async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    // Check if user is the creator or an admin
  //  if (req.user && (poll.creator.toString() === req.user.id || req.user.admin)) {
    await Poll.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Poll deleted successfully"
    });
    
  } catch (err) {
    next(err);
  }
};


// Submit a poll response
const solvePoll = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      employment_status, 
      teaching, 
      date_of_birth, 
      address, 
      gender, 
      solve,
      pollId 
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !employment_status || !teaching || !date_of_birth || !address || !gender || !solve || !Array.isArray(solve)) {
      return next(errorHandler(400, "Please provide all required fields"));
    }
    
    // Check if poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    // Check if poll is active
    if (!poll.isActive) {
      return next(errorHandler(400, "This poll is no longer active"));
    }
    
    // Create new poll response
    const newPollResponse = new PollResponse({
      poll: pollId,
      name,
      email,
      employment_status,
      teaching,
      date_of_birth,
      address,
      gender,
      responses: solve.map(item => ({
        questionId: item.questionId,
        answerId: item.answerId
      }))
    });
    
    // Save the response
    const savedResponse = await newPollResponse.save();
    
    res.status(201).json({
      success: true,
      message: "Poll response submitted successfully",
      response: savedResponse
    });
  } catch (err) {
    next(err);
  }
};

// Get poll responses with user and answer details
const getPollResponses = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    
    // Check if poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return next(errorHandler(404, "Poll not found"));
    }
    
    // Get all responses for this poll
    const pollResponses = await PollResponse.find({ poll: pollId });
    
    // Format the responses as required
    const formattedResponses = [];
    
    // Process each poll response
    for (const response of pollResponses) {
      // Get the user info from the response
      const user = {
        name: response.name || "",
        email: response.email || "",
        id: response._id,
        employment_status: response.employment_status || "",
        teaching: response.teaching || "",
        date_of_birth: response.date_of_birth || "",
        address: response.address || "",
        gender: response.gender || ""
      };
      
      // Process each question response
      for (const questionResponse of response.responses) {
        // Find the question in the poll
        const question = poll.questions.find(q => 
          q._id.toString() === questionResponse.questionId.toString()
        );
        
        if (question) {
          // Find the answer in the question
          const answer = question.answers.find(a => 
            a._id.toString() === questionResponse.answerId.toString()
          );
          
          if (answer) {
            formattedResponses.push({
              user,
              answer: {
                id: answer._id,
                points: answer.points,
                text: answer.text,
                Question: {
                  text: question.text
                }
              }
            });
          }
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        answers: formattedResponses
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  updatePoll,
  deletePoll,
  solvePoll,
  getPollResponses
};
