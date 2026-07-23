import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * Temporary service-to-service guard until JWT Auth module lands.
 * Header: x-internal-api-key
 */
@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('INTERNAL_API_KEY');
    if (!expected) {
      throw new UnauthorizedException('INTERNAL_API_KEY is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-internal-api-key');

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
