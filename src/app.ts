import "reflect-metadata";
import "./containers";

import express from "express";
import cors from "cors";
import connectMongoDB from "./database/mongoDb";

import { AuthRoutes } from "./modules/auth/auth.routes";
import { TeacherRoutes } from "./modules/teacher/teacher.routes";
import { ExperimentRoutes } from "./modules/experiment/experiment.routes";
import { BodyWaterLossResponseRoutes } from "./modules/body-water-loss-response/body-water-loss-response.routes";
import { GlycemicControlResponseRoutes } from "./modules/glycemic-control-response/glycemic-control-response.routes";

import { config } from "dotenv";

import errorHandler from "./middlewares/errorHandler";

config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());

//middleware
app.use(express.json());

//conexão banco
connectMongoDB();

//rotas

app.use("/teacher", TeacherRoutes());
app.use("/auth", AuthRoutes());

app.use("/experiment", ExperimentRoutes());
app.use("/body-water-loss-response", BodyWaterLossResponseRoutes());
app.use("/glycemic-control-response", GlycemicControlResponseRoutes());

// error handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server is running on port ${port}`));
