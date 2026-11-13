import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'development-secret';

export default function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;
    const [scheme, token, extra] = authorization ? authorization.split(' ') : [];

    if (scheme !== 'Bearer' || !token || extra) {
        return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}