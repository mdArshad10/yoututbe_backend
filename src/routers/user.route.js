import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  generateRefreshTokenUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isAuth } from "../middlewares/isAuth.middleware.js";

const router = Router();

// user register
router.route("/createUser").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// user login
router.route("/loginUser").post(loginUser);
// logout the user
router.route("/logout").get(isAuth, logoutUser);
// generate the refersh token
router.route("/refresh-token").post(generateRefreshTokenUser)

export default router;
