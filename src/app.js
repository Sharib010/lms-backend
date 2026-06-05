const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("express-async-errors");

const { tenantMiddleware } = require("./middleware/tenant.middleware");
const { requestIdMiddleware } = require("./middleware/requestId.middleware");
const { errorHandler } = require("./middleware/errorHandler.middleware");
const { notFound } = require("./middleware/notFound.middleware");
const routes = require("./routes");
const logger = require("./config/logger");

const app = express();

// ── Security ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(mongoSanitize());                // prevent MongoDB operator injection
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ── Request parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());

// ── Observability ─────────────────────────────────────────────────────────
app.use(requestIdMiddleware);
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Multi-tenancy ─────────────────────────────────────────────────────────
app.use(tenantMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ── Error handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
