import { IsEmail, IsJSON, IsNumber, isNumberString, IsString } from "class-validator";
import { User } from "@interfaces/users.interface";

export class CreateUserDto {
  @IsEmail()
  public email?: string;

  @IsString()
  public password?: string;

  @IsNumber()
  public telegram_user_id: number;

  @IsJSON()
  public json_data ?: string | object;

  @IsString()
  public first_name?: string;

  @IsString()
  public last_name?: string;

  @IsString()
  public username?: string;
}
