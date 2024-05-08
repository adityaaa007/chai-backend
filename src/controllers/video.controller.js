import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  let videoQuery = {};

  if (userId) videoQuery.userId = userId;
  if (query) {
    videoQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const skipAmount = (page - 1) * limit;
  const videos = await Video.aggregate([
    {
      $match: videoQuery,
    },
    {
      $sort: {
        [sortBy]: sortType === "ascending" ? 1 : -1,
      },
    },
    {
      $skip: skipAmount,
    },
    {
      $limit: limit,
    },
  ]);

  if (!videos) throw new ApiError(500, "Error while fetching videos from db");

  return res
    .status(201)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoFileLocalPath = req.files?.videoFile[0].path;
  if (!videoFileLocalPath) throw new ApiError(400, "Video file is missing");

  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail file is missing");

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  if (!videoFile.url)
    throw new ApiError(500, "Error while uploading videoFile to cloudinary");

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url)
    throw new ApiError(500, "Error while uploading thumbnail to cloudinary");

  // console.log("videoFile: " + JSON.stringify(videoFile));

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: new mongoose.Types.ObjectId(req.user._id),
    title,
    description,
    duration: videoFile.duration,
  });

  if (!video) throw new ApiError(500, "Error while saving video details in db");

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video details fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file.path;
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail file is missing");

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url)
    throw new ApiError(500, "Error while uploading thumbnail to cloudinary");

  const video = await Video.findById(videoId);
  const oldThumbnailUrl = video?.thumbnail;
  const publicId = oldThumbnailUrl?.match(/\/v\d+\/([^/.]+)\.\w+$/)[1];
  await deleteFromCloudinary(publicId, "image");

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { thumbnail: thumbnail.url, title, description } },
    { new: true }
  );

  if (!updatedVideo)
    throw new ApiError(500, "Error while saving video details in db");

  return res
    .status(201)
    .json(
      new ApiResponse(200, updatedVideo, "Video details updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  // delete old files
  const videoFilePublicId = video.videoFile?.match(
    /\/v\d+\/([^/.]+)\.\w+$/i
  )[1];
  const thumbnailPublicId = video.thumbnail?.match(/\/v\d+\/([^/.]+)\.\w+$/)[1];
  await deleteFromCloudinary(videoFilePublicId, "video");
  await deleteFromCloudinary(thumbnailPublicId, "image");

  await Video.findByIdAndDelete(videoId);

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  // console.log(JSON.stringify(video));

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "isPublished toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
