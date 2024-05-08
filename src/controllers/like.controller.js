import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const likeExist = await Like.findOne({ video: videoId });

  // like exists
  let like;
  if (likeExist) {
    like = await Like.where({
      video: new mongoose.Types.ObjectId(videoId),
    }).deleteOne();
  }
  // like don`t exists
  else {
    like = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: new mongoose.Types.ObjectId(req.user._id),
    });
  }

  if (like)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like toggled successfully"));
  else throw new ApiError(500, "Error while toggling like");
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const likeExist = await Like.findOne({ comment: commentId });

  // like exists
  let like;
  if (likeExist) {
    like = await Like.where({
      comment: new mongoose.Types.ObjectId(commentId),
    }).deleteOne();
  }
  // like don`t exists
  else {
    like = await Like.create({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: new mongoose.Types.ObjectId(req.user._id),
    });
  }

  if (like)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like toggled successfully"));
  else throw new ApiError(500, "Error while toggling like");
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const likeExist = await Like.findOne({ tweet: tweetId });

  // like exists
  let like;
  if (likeExist) {
    like = await Like.where({
      tweet: new mongoose.Types.ObjectId(tweetId),
    }).deleteOne();
  }
  // like don`t exists
  else {
    like = await Like.create({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: new mongoose.Types.ObjectId(req.user._id),
    });
  }

  if (like)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Like toggled successfully"));
  else throw new ApiError(500, "Error while toggling like");
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const videos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "video",
        as: "video",
      },
    },
    {
      $project: {
        video: 1,
      },
    },
  ]);

  if (videos)
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
  else throw new ApiError(500, "Error while fetching videos");
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
