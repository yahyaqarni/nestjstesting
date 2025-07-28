import { IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsString,  MinLength } from "class-validator";

export class SignupDto {

  @IsString()
  @IsOptional()
  name: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

}