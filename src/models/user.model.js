import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  accessRefreshToken,
  accessRefreshTokenExpire,
  accessToken,
  accessTokenExpire,
} from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary
      required: true,
    },
    coverImage: {
      type: String, // cloudinary
      required: true,
    },
    watchHistory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// mongoose middleware (pre hooks)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// customize the method for matching the password
// we inject the "isMatchingPassword()" in userSchema
userSchema.methods.isMatchingPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// create jsonwebtoken by inject the "generateToken()"
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    accessToken,
    { expiresIn: accessTokenExpire }
  );
};
// create refresh token by inject the "referenceToken()"
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    accessRefreshToken,
    { expiresIn: accessRefreshTokenExpire }
  );
};

export const User = mongoose.model("User", userSchema);
