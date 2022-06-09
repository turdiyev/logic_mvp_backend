import { IsEmail, IsEnum, IsJSON, IsNumber, isNumberString, IsString } from "class-validator";
import { OptionsEnum, Questions } from "@interfaces/questions.interface";
import { Tests } from "@interfaces/test.interface";

export class CreateResultsDto {
  @IsEnum(OptionsEnum)
  public selected_option?: OptionsEnum;

  @IsNumber()
  test?: Tests;

  @IsJSON()
  question: Questions;
}
