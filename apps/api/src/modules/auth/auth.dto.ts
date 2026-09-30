import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}

export class RegisterDto extends LoginDto {
  @IsString() @Length(1, 60) firstName: string;
  @IsString() @Length(1, 60) lastName: string;
}

export class RefreshDto {
  @IsString() @MinLength(20) refreshToken: string;
}
