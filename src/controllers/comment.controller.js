import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import APIError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new APIError(400, "Video ID is required");
  }

  const commentAggregator = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
  ]);

  if (commentAggregator.length === 0) {
    throw new APIError(404, "No comments found for this video");
  }

  try {
    const comments = await Comment.aggregatePaginate(commentAggregator, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while fetching the comments"
    );
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content || !videoId) {
    throw new APIError(400, "Content and video ID are required");
  }

  try {
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: req.user._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, comment, "Comment added successfully"));
  } catch (error) {
    throw new APIError(500, "Something went wrong while adding the comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content || !commentId) {
    throw new APIError(400, "Content and comment ID are required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new APIError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new APIError(403, "You are not authorized to update this comment");
  }

  try {
    const newComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, newComment, "Comment updated successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while updating the comment"
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new APIError(400, "Comment ID is required");
  }

  try {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      throw new APIError(404, "Comment not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while deleting the comment"
    );
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
