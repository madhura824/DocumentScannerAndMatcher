
import jwt from 'jsonwebtoken';

export class AuthService {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }


  generateToken(userId: string, userName: string): string {
    const payload = { userId, userName };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: '24h' });
    return token;
  }


  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
