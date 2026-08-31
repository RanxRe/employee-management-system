import app from "./src/app.js";
import { connectDB } from "./src/config/connectDB.js";
import { ENV } from "./src/utils/env.js";

const PORT = ENV.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server is running @ http://localhost:${PORT}`));
});
