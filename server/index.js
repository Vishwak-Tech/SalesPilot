import app from "./app.js";
import connectDB from "./config/db.js";

let connectionPromise;

const handler = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB().catch((error) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;

    return app(req, res);
  } catch (error) {
    console.error("Backend initialization failed:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default handler;