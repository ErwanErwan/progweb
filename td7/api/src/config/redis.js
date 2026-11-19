import { createClient } from 'redis';

process.loadEnvFile();

export const redisClient = createClient({
    url: process.env.REDIS_URI || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis error:', err));

export async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Redis Connected');
    }
}
