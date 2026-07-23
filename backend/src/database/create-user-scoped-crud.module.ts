/**
 * Factory for user-scoped NestJS CRUD modules (JWT or internal API key).
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Type,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel, SequelizeModule } from '@nestjs/sequelize';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { Model, ModelCtor } from 'sequelize-typescript';
import type { Request } from 'express';
import { JwtOrApiKeyGuard } from '../common/guards/jwt-or-api-key.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginatedResponse } from '../common/utils/pagination.util';
import type { AuthenticatedUser } from '../modules/auth/auth.types';

export class UserScopedQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Required when using x-internal-api-key; ignored for JWT (uses token subject)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

function resolveUserId(
  req: Request & { user?: AuthenticatedUser; authVia?: string },
  explicit?: string,
): string {
  if (req.authVia === 'jwt' && req.user?.id) {
    return req.user.id;
  }
  if (explicit) {
    return explicit;
  }
  throw new UnauthorizedException('userId is required when using API key auth');
}

export function createUserScopedCrudModule<M extends Model>(options: {
  name: string;
  tag: string;
  model: ModelCtor<M>;
}): Type<unknown> {
  const { name, tag, model } = options;
  const entityLabel = name.replace(/-/g, ' ').replace(/s$/, '');

  @Injectable()
  class DynamicService {
    constructor(@InjectModel(model) private readonly entity: ModelCtor<M>) {}

    async create(body: Record<string, unknown>, userId: string) {
      const row = await this.entity.create({ ...body, userId } as never);
      return row.get({ plain: true });
    }

    async findAll(userId: string, query: UserScopedQueryDto) {
      const { rows, count } = await this.entity.findAndCountAll({
        where: { userId } as never,
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
        order: [[query.sortBy ?? 'createdAt', query.sortOrder ?? 'DESC']],
      });
      return buildPaginatedResponse(
        rows.map((r) => r.get({ plain: true })),
        count,
        query.page,
        query.limit,
      );
    }

    async findOne(id: string, userId: string) {
      const row = await this.entity.findOne({
        where: { id, userId } as never,
      });
      if (!row) {
        throw new NotFoundException(`${entityLabel} ${id} not found`);
      }
      return row.get({ plain: true });
    }

    async update(id: string, userId: string, body: Record<string, unknown>) {
      const existing = await this.entity.findOne({
        where: { id, userId } as never,
      });
      if (!existing) {
        throw new NotFoundException(`${entityLabel} ${id} not found`);
      }
      const { userId: _u, id: _i, ...rest } = body;
      const updated = await existing.update(rest as never);
      return updated.get({ plain: true });
    }

    async remove(id: string, userId: string) {
      const existing = await this.entity.findOne({
        where: { id, userId } as never,
      });
      if (!existing) {
        throw new NotFoundException(`${entityLabel} ${id} not found`);
      }
      await existing.destroy();
      return { id, deleted: true };
    }
  }

  @ApiTags(tag)
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-internal-api-key', required: false })
  @UseGuards(JwtOrApiKeyGuard)
  @Controller({ path: name, version: '1' })
  class DynamicController {
    constructor(private readonly service: DynamicService) {}

    @Post()
    @ApiOperation({ summary: `Create ${entityLabel}` })
    create(
      @Body() body: Record<string, unknown>,
      @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
    ) {
      const userId = resolveUserId(req, body.userId as string | undefined);
      return this.service.create(body, userId);
    }

    @Get()
    @ApiOperation({ summary: `List ${name}` })
    findAll(
      @Query() query: UserScopedQueryDto,
      @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
    ) {
      const userId = resolveUserId(req, query.userId);
      return this.service.findAll(userId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: `Get ${entityLabel}` })
    findOne(
      @Param('id', ParseUUIDPipe) id: string,
      @Query('userId') userIdQuery: string | undefined,
      @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
    ) {
      const userId = resolveUserId(req, userIdQuery);
      return this.service.findOne(id, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: `Update ${entityLabel}` })
    update(
      @Param('id', ParseUUIDPipe) id: string,
      @Query('userId') userIdQuery: string | undefined,
      @Body() body: Record<string, unknown>,
      @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
    ) {
      const userId = resolveUserId(req, userIdQuery ?? (body.userId as string | undefined));
      return this.service.update(id, userId, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: `Delete ${entityLabel}` })
    remove(
      @Param('id', ParseUUIDPipe) id: string,
      @Query('userId') userIdQuery: string | undefined,
      @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
    ) {
      const userId = resolveUserId(req, userIdQuery);
      return this.service.remove(id, userId);
    }
  }

  @Module({
    imports: [SequelizeModule.forFeature([model])],
    controllers: [DynamicController],
    providers: [DynamicService, JwtOrApiKeyGuard],
    exports: [DynamicService],
  })
  class DynamicModule {}

  Object.defineProperty(DynamicModule, 'name', { value: `${tag}Module` });
  return DynamicModule;
}
