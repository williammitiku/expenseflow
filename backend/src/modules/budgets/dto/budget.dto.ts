import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BudgetPeriod } from '@expenseflow/shared';

export class CreateBudgetDto {
  @ApiPropertyOptional({
    description: 'Required with x-internal-api-key; ignored for JWT',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'Food' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: BudgetPeriod, default: BudgetPeriod.MONTHLY })
  @IsOptional()
  @IsEnum(BudgetPeriod)
  period?: BudgetPeriod;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: 'ETB' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  walletId?: string | null;

  @ApiPropertyOptional({ type: [Number], example: [50, 75, 90, 100] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  alertThresholds?: number[];

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  startDate!: string;
}

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
