import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import type { Request } from 'express';
import { JwtOrApiKeyGuard } from '../../common/guards/jwt-or-api-key.guard';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { GoalsService } from './goals.service';
import {
  ContributeGoalDto,
  CreateGoalDto,
  UpdateGoalDto,
} from './dto/goal.dto';

class GoalQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;
}

function resolveUserId(
  req: Request & { user?: AuthenticatedUser; authVia?: string },
  explicit?: string,
): string {
  if (req.authVia === 'jwt' && req.user?.id) return req.user.id;
  if (explicit) return explicit;
  throw new UnauthorizedException('userId is required when using API key auth');
}

@ApiTags('goals')
@ApiBearerAuth()
@ApiHeader({ name: 'x-internal-api-key', required: false })
@UseGuards(JwtOrApiKeyGuard)
@Controller({ path: 'goals', version: '1' })
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a savings goal' })
  create(
    @Body() body: CreateGoalDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, body.userId);
    return this.goals.create({ ...body, userId });
  }

  @Get()
  @ApiOperation({ summary: 'List goals with progress' })
  findAll(
    @Query() query: GoalQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.goals.findAll(userId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GoalQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.goals.findOne(id, userId);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Add progress toward a goal (optionally debit a wallet)' })
  contribute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ContributeGoalDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, body.userId);
    return this.goals.contribute(id, userId, body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGoalDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, body.userId);
    return this.goals.update(id, userId, body);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GoalQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.goals.remove(id, userId);
  }
}
