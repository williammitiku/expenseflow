import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok when postgres and redis are up', async () => {
    const config = {
      get: jest.fn((key: string, fallback?: unknown) => {
        if (key === 'app.name') return 'ExpenseFlow';
        if (key === 'redis.host') return 'localhost';
        if (key === 'redis.port') return 6379;
        if (key === 'redis.password') return undefined;
        return fallback;
      }),
    };

    const sequelize = {
      query: jest.fn().mockResolvedValue([[{ '?column?': 1 }]]),
    };

    const service = new HealthService(config as never, sequelize as never);

    // Mock Redis path by spying private method
    jest.spyOn(service as never, 'checkRedis' as never).mockResolvedValue({
      status: 'up',
      latencyMs: 1,
    } as never);

    const result = await service.getStatus();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('ExpenseFlow');
    expect(result.checks.postgres.status).toBe('up');
    expect(result.checks.redis.status).toBe('up');
  });
});
