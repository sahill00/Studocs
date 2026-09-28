const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  console.warn('Redis connection error (Caching will be bypassed):', err.message);
});

// Attempt to connect, but don't crash if it fails
(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.warn('Could not connect to Redis, caching disabled.');
  }
})();

module.exports = client;
