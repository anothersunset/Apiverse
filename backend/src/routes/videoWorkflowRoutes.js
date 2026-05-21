import { Router } from 'express';
import { createAndStart, getStatus, streamEvents, retry, getFinal } from '../controllers/videoWorkflowController.js';

const router = Router();
router.post('/',                  createAndStart);
router.get('/:id',                getStatus);
router.get('/:id/events',         streamEvents);
router.post('/:id/retry/:sceneId', retry);
router.get('/:id/final',          getFinal);

export default router;
