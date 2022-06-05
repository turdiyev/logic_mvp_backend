import { IsEmail, IsJSON, IsNumber, isNumberString, IsString } from "class-validator";
import { User } from "@interfaces/users.interface";

export class CreateTestsDto {
  @IsNumber()
  public user_id: number;

  @IsString()
  public title?: string;
}
