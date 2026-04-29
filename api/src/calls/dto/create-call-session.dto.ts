import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateCallSessionDto {
  @IsOptional()
  @IsInt()
  @Min(2)
  maxParticipants?: number;
}
