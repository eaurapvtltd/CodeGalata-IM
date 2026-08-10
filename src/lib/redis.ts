import { createClient } from 'redis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url: redisUrl,
});

client.on('error', (err) => logger.error(err, 'Redis Client Error'));

let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (err) {
      logger.error(err, 'Failed to connect to Redis');
    }
  }
  return client;
}

// Update student score in leaderboards
export async function updateStudentLeaderboard(params: {
  collegeId: string;
  branchId: string;
  batchId: string;
  studentId: string;
  score: number;
}) {
  try {
    const redis = await getRedisClient();
    if (!isConnected) return;

    const { collegeId, branchId, batchId, studentId, score } = params;

    await Promise.all([
      redis.zAdd(`leaderboard:campus:${collegeId}`, { score, value: studentId }),
      redis.zAdd(`leaderboard:branch:${branchId}`, { score, value: studentId }),
      redis.zAdd(`leaderboard:batch:${batchId}`, { score, value: studentId }),
    ]);
  } catch (err) {
    logger.error(err, 'Error updating student leaderboard');
  }
}

// Update contest leaderboard
export async function updateContestLeaderboard(contestId: string, studentId: string, score: number) {
  try {
    const redis = await getRedisClient();
    if (!isConnected) return;
    await redis.zAdd(`leaderboard:contest:${contestId}`, { score, value: studentId });
  } catch (err) {
    logger.error(err, 'Error updating contest leaderboard');
  }
}

// Get leaderboard entries
export async function getLeaderboard(key: string, limit: number = 50): Promise<{ studentId: string; score: number }[]> {
  try {
    const redis = await getRedisClient();
    if (!isConnected) return [];

    // Get highest scores first (REV: true)
    const result = await redis.zRangeWithScores(key, 0, limit - 1, { REV: true });
    return result.map(entry => ({
      studentId: entry.value,
      score: entry.score,
    }));
  } catch (err) {
    logger.error(err, 'Error fetching leaderboard');
    return [];
  }
}
