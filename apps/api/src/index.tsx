import { Hono } from 'hono'
// import { renderer } from './renderer'

const app = new Hono()

// TODO: for jsx
// app.use(renderer)

app.get('/', (c) => {
  return c.text("Hello!")
})

export default app
