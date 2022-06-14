import { OptionsEnum, Questions } from "@interfaces/questions.interface";
import { Status } from "@entities/test.entity";
import { Tests } from "@interfaces/test.interface";

export interface Results {
  id?: number;
  selected_option?: OptionsEnum;
  test?: Tests;
  question?: Questions;
  test_id?: number;
  question_id?: number;
  completed_time?: number;
}
