import "reflect-metadata";
import "./containers";

import { createServer } from "node:http";
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
import { initSockets } from "./sockets";
import { validateEnv } from "./shared/env";

config();

const envErrors = validateEnv();
if (envErrors.length > 0) {
  console.error("Erro de configuração:");
  envErrors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 8000;

const corsOrigin = process.env.CORS_ORIGIN!;
app.use(cors({ origin: corsOrigin, credentials: true }));

//middleware
app.use(express.json({ limit: "10kb" }));

// health check
app.get('/health', async (_req, res) => {
  const mongoose = (await import('mongoose')).default;
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', mongo: mongoStatus });
});

//rotas

app.use("/teacher", TeacherRoutes());
app.use("/auth", AuthRoutes());

app.use("/experiment", ExperimentRoutes());
app.use("/body-water-loss-response", BodyWaterLossResponseRoutes());
app.use("/glycemic-control-response", GlycemicControlResponseRoutes());

// error handler
app.use(errorHandler);

const httpServer = createServer(app);
const { io } = initSockets(httpServer);

async function bootstrap() {
  try {
    await connectMongoDB();

    httpServer.listen(port, () =>
      console.log(`Server is running on port ${port}`),
    );
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} recebido, encerrando com segurança...`);

  const forceExit = setTimeout(() => {
    console.error("Encerramento forçado após timeout");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    await new Promise<void>((resolve) => {
      io.close(() => {
        console.log("Socket.IO fechado");
        resolve();
      });
    });

    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
    console.log("MongoDB desconectado");

    process.exit(0);
  } catch (error) {
    console.error("Erro durante encerramento:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

bootstrap();
