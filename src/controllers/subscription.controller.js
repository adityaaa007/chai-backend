import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (channelId == req.user?._id)
    throw new ApiError(401, "Channel id and user id is same");

  const validChannelId = await User.findById(channelId);

  if (!validChannelId) throw new ApiError(401, "Invalid channelId");

  // find whether the channelId is already subscribed
  const subscriber = await Subscription.findOne({
    $and: [{ channel: channelId }, { subscriber: req.user?._id }],
  });

  // already a subscriber
  if (subscriber) {
    await Subscription.findOneAndDelete({
      $and: [{ channel: channelId }, { subscriber: req.user?._id }],
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Successfully unsubscribed " + channelId));
  }
  // add as subscriber
  else {
    const newSubscription = new Subscription({
      subscriber: req.user?._id,
      channel: channelId,
    });
    await newSubscription.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          newSubscription,
          "Successfully subscribed " + channelId
        )
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribersList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "subscriber",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        subscriber: 1,
      },
    },
  ]);

  if (!subscribersList) throw new ApiError(404, "No channels found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribersList,
        "Subscribers list fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channelList = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "channel",
        as: "channel",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channel: 1,
      },
    },
  ]);

  if (!channelList) throw new ApiError(404, "No channels found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelList, "Channel list fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
