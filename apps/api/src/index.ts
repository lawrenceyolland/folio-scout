import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { requestId } from 'hono/request-id'

import healthRoute from './routes/health.js';
import analyseRoute from './routes/analyse.js';
import statusRoute from "./routes/status.js";
import resultsRoute from "./routes/results.js";

const app = new Hono()
app.use('*', requestId())

app.route("/health", healthRoute)
app.route("/analyse", analyseRoute)
app.route("/status", statusRoute)
app.route("/results", resultsRoute)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
