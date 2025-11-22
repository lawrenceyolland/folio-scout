import {Hono} from 'hono';

import healthRoute from './routes/health';
import analyseRoute from './routes/analyse';
import statusRoute from "./routes/status";
import resultsRoute from "./routes/results";


const app = new Hono()

app.route("/health", healthRoute)
app.route("/analyse", analyseRoute)
app.route("/status", statusRoute)
app.route("/results", resultsRoute)

export default app