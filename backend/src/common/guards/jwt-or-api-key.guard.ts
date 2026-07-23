import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Accepts either Bearer JWT or x-internal-api-key (service-to-service).
 */
@Injectable()
export class JwtOrApiKeyGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: unknown; authVia?: string }>();
    const apiKey = request.header('x-internal-api-key');
    const expected = this.config.get<string>('auth.internalApiKey');

    if (apiKey && expected && apiKey === expected) {
      request.authVia = 'api-key';
      return true;
    }

    try {
      const ok = (await super.canActivate(context)) as boolean;
      if (ok) {
        request.authVia = 'jwt';
      }
      return ok;
    } catch {
      throw new UnauthorizedException(
        'Missing or invalid Authorization Bearer token / x-internal-api-key',
      );
    }
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
