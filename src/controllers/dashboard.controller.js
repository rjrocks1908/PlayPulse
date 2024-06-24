import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import APIError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const totalVideoViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $facet: {
        totalViews: [
          {
            $group: {
              _id: null,
              totalVideoViews: {
                $sum: "$views",
              },
            },
          },
        ],
        totalCount: [
          {
            $count: "totalVideos",
          },
        ],
        videoLikes: [
          {
            $lookup: {
              from: "likes", // The collection name for the Like model
              localField: "video",
              foreignField: "_id",
              as: "likes",
            },
          },
          {
            $unwind: "$likes",
          },
          {
            $group: {
              _id: null,
              totalLikes: { $sum: 1 },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalVideoViews: {
          $ifNull: [{ $arrayElemAt: ["$totalViews.totalVideoViews", 0] }, 0],
        },
        totalVideos: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.totalVideos", 0] }, 0],
        },
        totalLikes: {
          $ifNull: [{ $arrayElemAt: ["$videoLikes.totalLikes", 0] }, 0],
        },
      },
    },
  ]);

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $facet: {
        total: [
          {
            $count: "totalSubscribers",
          },
        ],
      },
    },
    {
      $project: {
        totalSubscribers: {
          $cond: {
            if: { $eq: ["$total", []] },
            then: 0,
            else: { $arrayElemAt: ["$total.totalSubscribers", 0] },
          },
        },
      },
    },
  ]);

  const data = {
    videoDetails: totalVideoViews[0],
    subscriberDetails: totalSubscribers[0],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ owner: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
