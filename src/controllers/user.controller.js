import { AsyncHandler } from "../utils/AsyncHandler.js";
import ApiResponse  from "../utils/ApiResponse.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

// @Desc: register the user
// @Method: [POST]  /api/v1/user/createUser
// @Access: public
const registerUser = AsyncHandler(async (req, res, next) => {
  //1. get all data from user
  const { username, email, fullName, password } = req.body;
  // validate data
  if ([username, email, fullName, password].some((item) => item?.trim() === "")){
    throw new ErrorHandler("filed is missing", 422);
}
  // check if user already exist or not
  const userExist = await User.findOne({ $or: [{ email, username }] });
  if (userExist) throw new ErrorHandler("user already exist", 409);
  
  // check image, check avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // if coverImageLocalPath give undefined value
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght>0){
    coverImageLocalPath = req.files.coverImage.path;
  }
  
  if (!avatarLocalPath) throw new ErrorHandler("file is not given", 400);

  // upload the image into clodinary
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);
  console.log(avatar);

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
    const createdUser = await User.findById(user._id).select("-password -refeshToken");

  // check the user creation
  if(!createdUser) throw new ErrorHandler("some thing went wrong while during the registation",500)

  // send the respo
  res.status(201).json(new ApiResponse(200,"user registered successfully", createdUser));
});

export { registerUser };
