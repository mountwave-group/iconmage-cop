import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    description: 'Registered email address of the user.',
    example: 'varvara@iconimage.group',
  })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: 'Account password — minimum 8 characters.',
    example: 'Owner!Passw0rd',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  password!: string
}

export class RefreshDto {
  @ApiProperty({
    description: 'Refresh token returned by /auth/login or a previous /auth/refresh call.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI...',
  })
  @IsNotEmpty()
  refreshToken!: string
}
