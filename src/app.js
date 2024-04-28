import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";

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

export default app;
