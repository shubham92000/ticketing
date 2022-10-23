import express from 'express';
import { currentUser } from '@ticket-mssg/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, async (req, res) => {
	res.send({ currentUser: req.currentUser || null });
});

export { router as currentuserRouter };
