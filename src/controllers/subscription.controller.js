import mongoose, { isValidObjectId } from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";
import APIError from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new APIError(404, "Channel not found");
  }

  try {
    const subscription = await Subscription.findOne({
      channel: channelId,
      subscriber: req.user._id,
    });

    if (!subscription) {
      const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id,
      });

      return res
        .status(201)
        .json(
          new ApiResponse(201, newSubscription, "New Subscription created")
        );
    }

    await subscription.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscription removed successfully"));
  } catch (error) {
    throw new APIError(500, error?.message || "Something went wrong");
  }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new APIError(404, "Channel not found");
  }

  try {
    const subscribers = await Subscription.find({
      channel: channelId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, subscribers, "Subscribers"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while fetching subscribers"
    );
  }
});

// Controller to return subscribed channels of a user
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new APIError(400, "Invalid subscriber ID");
  }

  const subscriber = await User.findById(subscriberId);

  if (!subscriber) {
    throw new APIError(404, "Subscriber not found");
  }

  try {
    const channels = await Subscription.find({
      subscriber: subscriberId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, channels, "Subscribed Channels"));
  } catch (error) {
    throw new APIError(500, error?.message || "Something went wrong");
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
