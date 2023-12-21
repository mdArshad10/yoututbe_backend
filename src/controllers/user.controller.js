import { AsyncHandler } from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

// generate the access and refersh token
const generateAccessAndRefershToken = async (userId) => {
  try {
    const existUser = await User.findById(userId);
    const accessToken = await existUser.generateToken();
    const refershToken = await existUser.refrshToken();
    existUser.refeshToken = refershToken;
    await existUser.save({ validateBeforeSave: false });
    return { accessToken, refershToken };
  } catch (error) {
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
    "-password -refeshToken"
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

  // generate the access token and refersh token
  const { accessToken, refershToken } = await generateAccessAndRefershToken(
    existUser._id
  );

  // remove the refershtoken and password by
  const loginUserDetail = await User.findById(existUser._id).select(
    "-password -refeshToken"
  );

  // create  the cookie option and send the data
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refershToken", refershToken, options)
    .json(
      new ApiResponse(200, "your are login successfully", {
        user: loginUserDetail,
        accessToken,
        refershToken,
      })
    );
});

export { registerUser, loginUser };
