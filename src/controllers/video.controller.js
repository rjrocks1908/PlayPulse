import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import APIError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideo = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const match = {};
  if (query) {
    match.$text = { $search: query };
  }

  match.owner = new mongoose.Types.ObjectId(!userId ? req.user._id : userId);

  const videosAggregator = Video.aggregate([
    {
      $match: match,
    },
    {
      $sort: {
        [sortBy]: sortType === "desc" ? -1 : 1,
      },
    },
  ]);

  const videos = await Video.aggregatePaginate(videosAggregator, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new APIError(400, "Title and description are required");
  }

  if (!req.files || !req.files.video || !req.files.thumbnail) {
    throw new APIError(400, "Video and thumbnail are required");
  }

  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new APIError(400, "Video and thumbnail are required");
  }

  // Upload Video and Thumbnail to Cloudinary
  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // Storing Data in database
  try {
    const publishedVideo = await Video.create({
      title,
      description,
      videoFile: video.url,
      thumbnail: thumbnail.url,
      duration: video.duration,
      owner: req.user,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(200, publishedVideo, "Video published successfully")
      );
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while publishing video"
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Video ID is required");
  }

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new APIError(404, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video fetched successfully"));
  } catch (error) {
    throw new APIError(404, error?.message + " Invalid Video ID");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!title || !description) {
    throw new APIError(400, "Title and Description are required");
  }

  if (!videoId) {
    throw new APIError(400, "Video ID is required");
  }

  try {
    const newVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
        },
      },
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, newVideo, "Video updated successfully"));
  } catch (error) {
    throw new APIError(404, error?.message + " Invalid Video ID");
  }
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!req.file || !req.file.path) {
    throw new APIError(400, "Thumbnail is required");
  }

  const thumbnailLocalPath = req.file.path;
  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new APIError(404, "Video not found");
    }

    const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    await deleteFromCloudinary(video.thumbnail);

    video.thumbnail = newThumbnail.url;
    await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, video, "Video thumbnail updated successfully")
      );
  } catch (error) {
    throw new APIError(404, error?.message + " Invalid Video ID");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(404, "Video not found");
  }

  await deleteFromCloudinary(video.thumbnail);
  await deleteFromCloudinary(
    video.videoFile,
    "video" /* resource Type, default is image*/
  );

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findById(videoId);

    if (!video) {
      throw new APIError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          video,
          "Video published status updated successfully"
        )
      );
  } catch (error) {
    throw new APIError(404, error?.message + " Invalid Video ID");
  }
});

export {
  getAllVideo,
  publishAVideo,
  getVideoById,
  updateVideo,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
};
