import { Status } from "@entities/test.entity";
import { Results } from "@interfaces/results.interface";
import { User } from "@interfaces/users.interface";

export interface Tests {
  id?: number;
  name?: string;
  status: Status;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  user: User;
  results?: Results[];
  paid_for_test?: number;
}
