import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import APIError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  try {
    const tweet = await Tweet.create({
      content,
      owner: req.user._id,
    });

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while creating tweet"
    );
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  try {
    const tweets = await Tweet.find({ owner: userId });
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while fetching tweets"
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid tweet ID");
  }

  try {
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { content },
      { new: true }
    );

    if (!tweet) {
      throw new APIError(404, "Tweet not found");
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while updating tweet"
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid tweet ID");
  }

  try {
    const tweet = await Tweet.findByIdAndDelete(tweetId);
    if (!tweet) {
      throw new APIError(404, "Tweet not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while deleting tweet"
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
