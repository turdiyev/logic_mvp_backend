import {  IsNumber, IsString } from "class-validator";
import { Options } from "@interfaces/questions.interface";

export class CreateQuestionsDto {
  @IsNumber()
  public number: number;

  @IsString()
  public correct_answer: Options;

  @IsString()
  public origin_test_name: string;

  @IsString()
  public image: string;
}
