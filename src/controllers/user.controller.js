import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // getting data from frontend
  const { fullName, email, username, password } = req.body;

  // data validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if the user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser)
    throw new ApiError(409, "User already exist with this email/username");

  // getting local path of image files uploaded by multer middleware
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverLocalPath = req.files?.coverImage[0]?.path;
  let coverLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) coverLocalPath = req.files.coverImage[0].path;

  // image path validation
  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  // uploading images to cloudinary and getting image meta-data
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  // image meta-data validation
  if (!avatar) throw new ApiError(400, "Avatar file is required");

  // creating a new user entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // check if the user is created in db
  const userCreated = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  if (!userCreated)
    throw new ApiError(500, "Something went wrong while registration of user");

  // return the response as created user data to frontend
  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User registered successfully"));
});

export default registerUser;
