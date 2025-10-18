import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { SubscriptionType } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType)
  type: SubscriptionType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  userId?: string;
}
