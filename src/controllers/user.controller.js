import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({ $or: [{ email }, { username }] });
  if (existedUser)
    throw new ApiError(409, "User already exist with this email/username");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.cover[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const cover = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar file is required");

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: cover?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const userCreated = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!userCreated)
    throw new ApiError(500, "Something went wrong while registration of user");

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User registered successfully"));
});

export default registerUser;
