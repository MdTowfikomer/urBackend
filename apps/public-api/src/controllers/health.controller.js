const mongoose = require('mongoose');
const { redis } = require('@urbackend/common');

const getHealth = async (req, res) => {
    const isMongoConnected = mongoose.connection.readyState === 1;

    let isRedisConnected = false;
    if (redis?.status === 'ready' && typeof redis.ping === 'function') {
        try {
            const pingResponse = await redis.ping();
            isRedisConnected = pingResponse === 'PONG';
        } catch (_error) {
            isRedisConnected = false;
        }
    }

    const status = isMongoConnected && isRedisConnected ? 'ok' : 'error';

    return res.status(status === 'ok' ? 200 : 503).json({
        status,
        timestamp: new Date().toISOString(),
        dependencies: {
            mongodb: isMongoConnected ? 'connected' : 'disconnected',
            redis: isRedisConnected ? 'connected' : 'disconnected',
        },
    });
};

module.exports = {
    getHealth,
};
