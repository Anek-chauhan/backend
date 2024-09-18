import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  const { fullName, email, username, password } = req.body;

  // Validation - not empty
  if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists: user or email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check for images, check for avatar
  const avatarFile = req.files?.avatar?.[0];
  const coverImageFile = req.files?.coverImage?.[0];

  if (!avatarFile) {
    throw new ApiError(400, "Avatar file is compulsory");
  }

  // Upload them to Cloudinary
  try {
    const avatar = await uploadOnCloudinary(avatarFile.path);
    const coverImage = coverImageFile ? await uploadOnCloudinary(coverImageFile.path) : null;

    // Create user object - create entry
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    });

    // Remove password and refresh token
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // Check for user creation
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong during registration");
    }

    // Return response
    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error uploading files to Cloudinary");
  }
});

export { registerUser };
