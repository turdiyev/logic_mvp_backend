import { Questions } from "@interfaces/questions.interface";
import { Status } from "@entities/test.entity";

export interface Tests {
  id: number;
  name: string;
  status: Status;
  questions?: Questions[];
}
