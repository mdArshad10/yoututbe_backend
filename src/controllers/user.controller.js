import { AsyncHandler } from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { accessRefreshToken } from "../constants.js";

// generate the access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const existUser = await User.findById(userId);
    const accessToken = await existUser.generateToken();

    // const refreshToken = await existUser.generateRefreshToken();
    const refToken = await existUser.generateRefreshToken();
    
    existUser.refreshToken = refToken;
    await existUser.save({ validateBeforeSave: false });
    console.log({ accessToken, refToken });
    return { accessToken, refToken };
  } catch (error) {
    console.log("error inside generateAccessAndRefreshToken function");
    throw new ErrorHandler({ error }, 404);
  }
};

// @Desc: register the user
// @Method: [POST]  /api/v1/user/createUser
// @Access: public
const registerUser = AsyncHandler(async (req, res, next) => {
  //1. get all data from user
  const { username, email, fullName, password } = req.body;
  // validate data
  if (
    [username, email, fullName, password].some((item) => item?.trim() === "")
  ) {
    throw new ErrorHandler("filed is missing", 422);
  }
  // check if user already exist or not
  const userExist = await User.findOne({ $or: [{ email }, { username }] });
  if (userExist) throw new ErrorHandler("user already exist", 409);

  // check image, check avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // if coverImageLocalPath give undefined value
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.lenght > 0
  ) {
    coverImageLocalPath = req.files.coverImage.path;
  }

  if (!avatarLocalPath) throw new ErrorHandler("file is not given", 400);

  // upload the image into clodinary
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ErrorHandler("avatar file is missing", 400);
  }

  // create user object
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || " ",
    password,
  });

  // remove the password and freshtoken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check the user creation
  if (!createdUser)
    throw new ErrorHandler(
      "some thing went wrong while during the registation",
      500
    );

  // send the respo
  res
    .status(201)
    .json(new ApiResponse(200, "user registered successfully", createdUser));
});

// @Desc: login the user
// @Method: [POST]  /api/v1/user/loginUser
// @Access: public
const loginUser = AsyncHandler(async (req, res, next) => {
  // req->body
  const { username, password, email } = req.body;

  if (!(username || email) || !password) {
    throw new ErrorHandler("plz fill the all field", 422);
  }

  // check the validation ,by username or email
  const existUser = await User.findOne({ $or: [{ email }, { username }] });

  if (!existUser) throw new ErrorHandler("invalid creditenal", 409);

  // check the password is correct or not
  const passwordIsMatch = await existUser.isMatchingPassword(password);

  if (!passwordIsMatch) throw new ErrorHandler("invalid creditenal", 409);

  console.log("before the generate token ");
  // generate the access token and refersh token
  const { accessToken, refToken } = await generateAccessAndRefreshToken(
    existUser._id
  );

  console.log("aftar the generate token ");
  // remove the refreshtoken and password by
  const loginUserDetail = await User.findById(existUser._id).select(
    "-password -refreshToken"
  );

  // create  the cookie option and send the data
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refToken, options)
    .json(
      new ApiResponse(200, "your are login successfully", {
        user: loginUserDetail,
        accessToken,
        refToken,
      })
    );
});

// @Desc: logout the user
// @Method: [GET]  /api/v1/user/logout
// @Access: private
const logoutUser = AsyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "your are logout successfully", {}));
});

// @Desc: use to generate the refresh token
// @Method: [POST]  /api/v1/user/refresh-token
// @Access: public
const generateRefreshTokenUser = AsyncHandler(async (req, res, next) => {
  const incomingRefToken = req.cookies?.refreshToken || req.body;

  if (!incomingRefToken) throw new ErrorHandler("unauthorized user", 404);
  try {

    const decode = jwt.verify(incomingRefToken, accessRefreshToken);
    console.log(decode);

    const user = await User.findById(decode?._id);
    if (!user) throw new ErrorHandler("invalid refresh token", 404);

    if (incomingRefToken !== user.refreshToken)
      throw new ErrorHandler("Refresh token is invalid or expire ", 401);

    const { accessToken, refToken } = generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refToken)
      .json(
        new ApiResponse(200, "refresh token update successfully", {
          accessToken,
          refToken,
        })
      );
  } catch (error) {
    throw new ErrorHandler(error.message, 404);
  }
});



export { registerUser, loginUser, logoutUser, generateRefreshTokenUser };
