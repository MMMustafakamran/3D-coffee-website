import { app } from "./app.js";
import { config } from "./config.js";
import { closeDatabase } from "./db/connection.js";

const server = app.listen(config.port, () => console.log(`EMBER API listening on http://localhost:${config.port}`));
const shutdown = () => server.close(() => { closeDatabase(); process.exit(0); });
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
