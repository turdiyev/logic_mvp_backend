import { IsEmail, IsEnum, IsJSON, IsNumber, isNumberString, IsString } from "class-validator";
import { Status } from "@entities/test.entity";

export class CreateTestsDto {
  @IsEnum(Status)
  public status: Status;

  @IsString()
  public name: string;

}
