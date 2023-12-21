import { config } from "dotenv";

config({ path: "./.env" });

const port = process.env.PORT || 4000;
const DatabaseName = "videotube";
const mongoURL = process.env.MONGO_URL;
const clodinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryAPIKey = process.env.CLOUDINARY_API_KEY;
const clodinaryAPISecret = process.env.CLOUDINARY_API_SECRET;

const accessToken = process.env.ACCESS_GENERATE_TOKEN;
const accessTokenExpire = process.env.ACCESS_GENERATE_TOKEN_EXPIRE;

const accessRefreshToken = process.env.ACCESS_REFRESH_TOKEN;
const accessRefreshTokenExpire =
  process.env.ACCES_REFRESH_GENERATE_TOKEN_EXPIRE;

export {
  port,
  mongoURL,
  DatabaseName,
  accessRefreshToken,
  accessRefreshTokenExpire,
  accessToken,
  accessTokenExpire,
  clodinaryCloudName,
  cloudinaryAPIKey,
  clodinaryAPISecret,
};
