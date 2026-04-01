import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string; // Recibimos la contraseña en texto plano, el servicio la hashea

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
