import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // for limiting JSON size
app.use(urlencoded({ extended: true, limit: "16kb" })); // for encoding-decoding of special chars in URL or as params
app.use(express.static("public")); // for storing files / data
app.use(cookieParser()); // for securely doing CRUD in browser cookies

// import and use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);

export default app;
