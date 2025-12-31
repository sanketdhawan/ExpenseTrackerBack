import { Router } from 'express';
import { register, login, verifyEmail, requestOtp, verifyOtp } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();



router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/me', authMiddleware, (req, res) => {
    res.json({
        message: 'Token is valid',
        userId: req.userId
    });
});

export default router;
