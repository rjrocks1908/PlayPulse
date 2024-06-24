import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import APIError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video Id is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid Video Id");
  }

  try {
    const like = await Like.findOne({ video: videoId, likedBy: req.user._id });
    if (!like) {
      const newLike = await Like.create({
        video: videoId,
        likedBy: req.user._id,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Video liked successfully"));
    }

    await like.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video unliked successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while liking the video"
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new APIError(400, "Comment Id is required");
  }

  if (!isValidObjectId(commentId)) {
    throw new APIError(400, "Invalid Comment Id");
  }

  try {
    const like = await Like.findOne({
      comment: commentId,
      likedBy: req.user._id,
    });
    if (!like) {
      const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Comment liked successfully"));
    }

    await like.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while liking the comment"
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new APIError(400, "Tweet Id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid Tweet Id");
  }

  try {
    const like = await Like.findOne({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    if (!like) {
      const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, newLike, "Tweet liked successfully"));
    }

    await like.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while liking the Tweet"
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user._id),
          video: {
            $ne: null,
          },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      {
        $unwind: "$videoDetails"
      },
      {
        $replaceRoot: { newRoot: '$videoDetails' }
      }
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, likedVideos, "All Liked Videos"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while getting liked videos"
    );
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
