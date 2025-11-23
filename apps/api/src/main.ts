import { Hono } from 'hono';
import healthRoute from './routes/health.js';
import analyseRoute from './routes/analyse.js';
import statusRoute from "./routes/status.js";
import resultsRoute from "./routes/results.js";

const app = new Hono()

app.route("/health", healthRoute);
app.route("/analyse", analyseRoute);
app.route("/status", statusRoute);
app.route("/results", resultsRoute);

export default app