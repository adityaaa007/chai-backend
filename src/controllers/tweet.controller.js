import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) throw new ApiError(401, "Content cant be empty");

  const tweet = await Tweet.create({
    content,
    owner: new mongoose.Types.ObjectId(userId),
  });

  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet posted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (tweets)
    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  if (tweet)
    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const deleted = await Tweet.findByIdAndDelete(tweetId);
  if (deleted)
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
  else throw new ApiError(500, "Error while deleting tweet");
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
