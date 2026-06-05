require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDatabase } = require("./config/database");
const { connectRedis }    = require("./config/redis");
const { startWorkers }    = require("./jobs");
const logger = require("./config/logger");

const PORT = process.env.PORT || 8000;

// Only run the long-lived server locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  async function bootstrap() {
    await connectDatabase();
    await connectRedis();
    await startWorkers();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`🚀 LMS API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    process.on("unhandledRejection", (err) => {
      logger.error("Unhandled Rejection:", err);
      server.close(() => process.exit(1));
    });
  }

  bootstrap();
}

module.exports = app;
