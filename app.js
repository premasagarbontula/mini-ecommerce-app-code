import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

//config env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);

//Extracts the directory path from the full filename: D:\CCBP\Projects\Ecommerce App 2024
const __dirname = path.dirname(__filename);

//Create Express app
const app = express();

//middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

//cd client and then do npm run build. A 'build' folder will be created
//Middleware for serving static files (HTML, CSS, JS, images)
//Express needs to serve the build folder when users hit your server
app.use(express.static(path.join(__dirname, "./client/build")));

//routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/product", productRoute);

//This line ensures all unknown routes return index.html, so React Router can handle routing in the browser instead of Express.
//SPA Fallback Route
app.use("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// Invalid route handler (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

//executes only when next(err) is called somewhere
// Global error handler (500)
app.use((err, req, res, next) => {
  // console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

//database connection and server start
const PORT = process.env.PORT || 8080;
const start = async () => {
  try {
    await connectDB();
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:");
    process.exit(1);
  }
};

start();
