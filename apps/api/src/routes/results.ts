import { Hono } from 'hono';

const router = new Hono();

router.get('/:id', (c) => {
    const id = c.req.param('id');

    // TODO: return real analysis results
    return c.json({
        success: true,
        data: {
            id,
            repoScore: null,
            designScore: null,
            feedback: []
        }
    });
});

export default router;
