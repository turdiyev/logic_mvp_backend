import { IsEmail, IsEnum, IsJSON, IsNumber, isNumberString, IsString } from "class-validator";
import { OptionsEnum, Questions } from "@interfaces/questions.interface";
import { Tests } from "@interfaces/test.interface";

export class CreateResultsDto {
  @IsEnum(OptionsEnum)
  public correct_option: OptionsEnum;

  @IsNumber()
  test: Tests;

  @IsNumber()
  questions: Questions;
}
