import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const jwtSecret = process.env.JWT_SECRET || 'development-secret';

export async function registerUser(email, password) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || typeof password !== 'string' || password.length === 0) {
        return { success: false, message: 'Email and password are required' };
    }

    try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return { success: false, message: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email: normalizedEmail, password: hashedPassword });

        return {
            success: true,
            data: { id: user._id, email: user.email }
        };
    } catch (err) {
        return { success: false, message: 'User not registered: ' + err.message };
    }
}

export async function loginUser(email, password) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || typeof password !== 'string' || password.length === 0) {
        return { success: false, message: 'Email and password are required' };
    }

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { success: false, message: 'Invalid credentials' };
        }

        const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
            expiresIn: '1h'
        });

        return {
            success: true,
            message: 'Login successful',
            user: { id: user._id, email: user.email },
            token
        };
    } catch (err) {
        return { success: false, message: 'Login failed: ' + err.message };
    }
}