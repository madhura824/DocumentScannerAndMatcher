import express from "express";
import  cors from "cors";
import dotenv from "dotenv";
import {DocumentRoutes} from "./routes/documentRoutes"

import { UserRoutes } from "./routes/updatedUserRoutes";
import { AdminRoutes } from "./routes/adminRoutes";
import { resetTotalCreditsAtMidnight } from "./lib/resetCreditsUtils";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
resetTotalCreditsAtMidnight()
app.get("/", (req, res) => {
    res.send("Hello from Node.js Backend!");
});
app.use("/documents",new DocumentRoutes().getRouter())
app.use("/users",new UserRoutes().getRouter())
app.use("/admins",new AdminRoutes().getRouter())

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


