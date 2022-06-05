import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password = 'Test2@22';

}
