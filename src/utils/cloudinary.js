import colors from "colors";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {clodinaryAPISecret, clodinaryCloudName,cloudinaryAPIKey} from '../constants.js'

const api_key = Number(cloudinaryAPIKey) ;

cloudinary.config({
  cloud_name :clodinaryCloudName,
  api_key,
  api_secret: clodinaryAPISecret,
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    // upload the file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file upload the successfully
    fs.unlinkSync(localFilePath);

    // send the url only
    return response;
  } catch (error) {
    console.log("error in cloudinary");
    console.log(error);
    // we unlink the unloaded file due to any reason
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export {uploadCloudinary}