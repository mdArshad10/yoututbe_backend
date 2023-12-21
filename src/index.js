import app from "./app.js";
import connectDB from "./db/connectDB.js";
import {port} from './constants.js'


connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is connected ${port}`.rainbow);
    });
    process.on("error", () => {
      console.log("process error".bgRed);
    });
  })
  .catch((error) => {
    console.log("the error is => ".bgRed, error);
    process.exit(1);
  });
