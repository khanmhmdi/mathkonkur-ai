import { describe, it, expect, afterAll } from '@jest/globals';
import { create, findByEmail, findById, update, deleteUser } from './user.repository';
import { ValidationError } from '../utils/errors';

describe('User Repository', () => {
  const testEmail = 'repo.test.' + Date.now() + '@test.com';
  let userId: string;

  afterAll(async () => {
    if (userId) {
      await deleteUser(userId).catch(() => {});
    }
  });

  it('should create a new user and normalize email', async () => {
    const created = await create({
      email: testEmail.toUpperCase(),
      passwordHash: '$2b$12$fakehashforTest',
      name: 'Repo Test',
      level: 'ریاضی فیزیک'
    });
    
    userId = created.id;
    expect(created.id).toBeDefined();
    expect(created.email).toBe(testEmail.toLowerCase());
    expect((created as any).passwordHash).toBeUndefined();
  });

  it('should find user by email and include password hash', async () => {
    const user = await findByEmail(testEmail);
    expect(user).not.toBeNull();
    expect(user?.passwordHash).toBe('$2b$12$fakehashforTest');
  });

  it('should find user by id and exclude password hash', async () => {
    const user = await findById(userId);
    expect(user).not.toBeNull();
    expect((user as any).passwordHash).toBeUndefined();
  });

  it('should update user name', async () => {
    const updated = await update(userId, { name: 'Updated Name' });
    expect(updated.name).toBe('Updated Name');
  });

  it('should reject duplicate email registration', async () => {
    await expect(create({ email: testEmail, passwordHash: 'hash' }))
      .rejects.toThrow(ValidationError);
  });

  it('should delete user', async () => {
    await deleteUser(userId);
    const user = await findById(userId);
    expect(user).toBeNull();
  });
});
