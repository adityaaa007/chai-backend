import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = Number(page);
  limit = Number(limit);

  const skipAmount = (page - 1) * limit;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: skipAmount,
    },
    {
      $limit: limit,
    },
  ]);

  if (comments)
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  else throw new ApiError(500, "Error while fetching comments");
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content) throw new ApiError(401, "Content is required");

  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(req.user._id),
  });

  if (comment)
    return res
      .status(201)
      .json(new ApiResponse(201, comment, "Comment posted successfully"));
  else throw new ApiError(500, "Error while posting comment");
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const { content } = req.body;

  if (!content) throw new ApiError(401, "Content is required");

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (comment)
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment updated successfully"));
  else throw new ApiError(500, "Error while updating comment");
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const deleted = await Comment.findByIdAndDelete(commentId);

  if (deleted)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  else throw new ApiError(500, "Error while deleting comment");
});

export { getVideoComments, addComment, updateComment, deleteComment };
