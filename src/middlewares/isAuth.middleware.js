import ErrorHandler from "../utils/ErrorHandler.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { accessToken } from "../constants.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const isAuth = AsyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ErrorHandler("unauthorized token", 401);
    }
    const decode = jwt.verify(token, accessToken);
    const user = await User.findById(decode._id).select(
      "-password -refeshToken"
    );

    if (!user) {
      throw new ErrorHandler("invalid access token", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ErrorHandler(error.message, 404);
  }
});
