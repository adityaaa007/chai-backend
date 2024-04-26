import "dotenv/config";

import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () =>
      console.log("Server is running at PORT: " + process.env.PORT)
    );
  })
  .catch((err) => console.error("Error in mongoDB connection: ", err.message));
