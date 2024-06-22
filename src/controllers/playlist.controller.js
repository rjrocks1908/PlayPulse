import APIError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new APIError(400, "Name and description are required");
  }

  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: req.user._id,
    });

    res
      .status(201)
      .json(new ApiResponse(201, playlist, "Playlist created successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while creating a playlist"
    );
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new APIError(400, "User id is required");
  }

  if (!isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  try {
    const playlists = await Playlist.find({ owner: userId });

    res
      .status(200)
      .json(
        new ApiResponse(200, playlists, "Playlists retrieved successfully")
      );
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while retrieving playlists"
    );
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new APIError(400, "Playlist id is required");
  }

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist id");
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new APIError(404, "Playlist not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while retrieving playlist"
    );
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new APIError(400, "Playlist id and video id are required");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid playlist id or video id");
  }

  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { videos: videoId } },
      { new: true }
    );

    if (!updatedPlaylist) {
      throw new APIError(404, "Playlist not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while adding video to playlist"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    throw new APIError(400, "Playlist id and video id are required");
  }

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid playlist id or video id");
  }

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new APIError(404, "Playlist not found");
    }

    if (!playlist.videos.includes(videoId)) {
      throw new APIError(404, "Video not found in the playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: videoId } },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist")
      );
  } catch (error) {
    throw new APIError(
      500,
      error?.message ||
        "Something went wrong while removing video from playlist"
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new APIError(400, "Playlist ID is required");
  }

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist ID");
  }

  try {
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
      throw new APIError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while deleting playlist"
    );
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new APIError(400, "Playlist ID is required");
  }

  if (!name || !description) {
    throw new APIError(400, "Name and description are required");
  }

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist ID");
  }

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        name: name,
        description: description,
      },
      {
        new: true,
      }
    );

    if (!playlist) {
      throw new APIError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
  } catch (error) {
    throw new APIError(
      500,
      error?.message || "Something went wrong while updating playlist"
    );
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
