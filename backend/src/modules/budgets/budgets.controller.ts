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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';

class BudgetQueryDto extends PaginationQueryDto {
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

@ApiTags('budgets')
@ApiBearerAuth()
@ApiHeader({ name: 'x-internal-api-key', required: false })
@UseGuards(JwtOrApiKeyGuard)
@Controller({ path: 'budgets', version: '1' })
export class BudgetsController {
  constructor(private readonly budgets: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a budget with period alerts' })
  create(
    @Body() body: CreateBudgetDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, body.userId);
    return this.budgets.create({ ...body, userId });
  }

  @Get()
  @ApiOperation({ summary: 'List budgets with spent / remaining progress' })
  findAll(
    @Query() query: BudgetQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.budgets.findAll(userId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: BudgetQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.budgets.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBudgetDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, body.userId);
    return this.budgets.update(id, userId, body);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: BudgetQueryDto,
    @Req() req: Request & { user?: AuthenticatedUser; authVia?: string },
  ) {
    const userId = resolveUserId(req, query.userId);
    return this.budgets.remove(id, userId);
  }
}
