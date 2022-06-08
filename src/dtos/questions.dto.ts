import {  IsNumber, IsString } from "class-validator";
import { OptionsEnum, TypeEnum } from "@interfaces/questions.interface";

export class CreateQuestionsDto {
  @IsNumber()
  public number: number;

  @IsString()
  public correct_answer: OptionsEnum;

  @IsString()
  public type: TypeEnum;

  @IsString()
  public origin_test_name: string;

  @IsString()
  public image: string;
}
