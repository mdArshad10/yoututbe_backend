// import package
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// rest obj
const app = express();

// middleware
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// import router
import userRouter from "./routers/user.route.js";

// router middleware
app.use("/api/v1/user", userRouter);

// export
export default app;
