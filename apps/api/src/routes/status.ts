import { Hono } from 'hono';

const router = new Hono();

// GET /status/:id
router.get('/:id', (c) => {
    const id = c.req.param('id');

    // TODO: fetch real job status (queued / running / done / error)
    return c.json({
        success: true,
        data: {
            id,
            status: 'queued'
        }
    });
});

export default router;
