import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramLoginDto {
  @ApiProperty({ example: 123456789 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  auth_date!: number;

  @ApiProperty()
  @IsString()
  @Matches(/^[a-f0-9]{64}$/i)
  hash!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class DevLoginDto {
  @ApiPropertyOptional({ example: 'demo@expenseflow.local' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
