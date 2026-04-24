import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @MinLength(8)
  password!: string
}

export class RefreshDto {
  @IsNotEmpty()
  refreshToken!: string
}
