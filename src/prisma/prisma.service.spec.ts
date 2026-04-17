import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const config = {
    get: jest.fn(() => 'postgresql://user:password@localhost:5432/waok_db'),
  } as unknown as ConfigService;

  it('should call $connect on module init', async () => {
    const service = new PrismaService(config);
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    const service = new PrismaService(config);
    const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should extend the client with the soft delete extension', () => {
    const service = new PrismaService(config);
    const extendedClient = { extended: true };
    const extendsSpy = jest.spyOn(service, '$extends').mockReturnValue(extendedClient as never);

    expect(service.withSoftDelete()).toBe(extendedClient);
    expect(extendsSpy).toHaveBeenCalled();
  });
});
