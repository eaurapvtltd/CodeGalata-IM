import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_code_galatta_2026_dev';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'another_super_secret_refresh_key_2026_dev';

export function signAccessToken(payload: { collegeId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: { collegeId: string; email: string }) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { collegeId: string; email: string };
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { collegeId: string; email: string };
  } catch (err) {
    return null;
  }
}
