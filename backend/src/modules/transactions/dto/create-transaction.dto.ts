import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { TransactionType } from '@expenseflow/shared';

export class CreateTransactionDto {
  @ApiPropertyOptional({ description: 'Required for API-key auth; taken from JWT otherwise' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsUUID()
  walletId!: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ example: '250.00' })
  @IsNumberString()
  amount!: string;

  @ApiPropertyOptional({ example: 'ETB' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Coffee' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  merchant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptImageKey?: string;

  @ApiProperty({ example: '2026-07-23T10:00:00.000Z' })
  @IsDateString()
  occurredAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  transferWalletId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentTransactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  recurringRuleId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
