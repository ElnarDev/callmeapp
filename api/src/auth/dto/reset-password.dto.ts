import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
