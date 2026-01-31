import { hashPassword, comparePassword, signToken, verifyToken } from '../../services/auth';

describe('auth service', () => {
  describe('hashPassword / comparePassword', () => {
    it('hashes a password and verifies it correctly', async () => {
      const hash = await hashPassword('secret123');
      expect(hash).not.toBe('secret123');
      await expect(comparePassword('secret123', hash)).resolves.toBe(true);
    });

    it('rejects wrong password', async () => {
      const hash = await hashPassword('secret123');
      await expect(comparePassword('wrong', hash)).resolves.toBe(false);
    });
  });

  describe('signToken / verifyToken', () => {
    it('signs and verifies a token', () => {
      const token = signToken('user-123');
      expect(verifyToken(token)).toBe('user-123');
    });

    it('returns null for invalid token', () => {
      expect(verifyToken('invalid.token.here')).toBeNull();
    });
  });
});
