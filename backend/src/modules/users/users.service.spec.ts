import { UsersService } from './users.service';
import { UserRole } from '@expenseflow/shared';

describe('UsersService', () => {
  const repo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByTelegramId: jest.fn(),
    findPaginated: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  const service = new UsersService(repo as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a user with defaults', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.findByTelegramId.mockResolvedValue(null);
    repo.create.mockResolvedValue({
      id: 'u1',
      firstName: 'Ada',
      lastName: null,
      username: null,
      email: null,
      telegramId: null,
      avatarUrl: null,
      role: UserRole.USER,
      preferredCurrency: 'ETB',
      timezone: 'Africa/Addis_Ababa',
      settings: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create({ firstName: 'Ada' });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Ada',
        role: UserRole.USER,
        preferredCurrency: 'ETB',
      }),
    );
    expect(result.firstName).toBe('Ada');
  });

  it('throws when user is missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow('User missing not found');
  });
});
