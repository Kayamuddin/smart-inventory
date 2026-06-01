import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import env from "./src/config/env.js";

await connectDB()

app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
})