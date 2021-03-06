import { Status } from "@entities/test.entity";
import { Results } from "@interfaces/results.interface";
import { User } from "@interfaces/users.interface";

export interface Tests {
  id?: number;
  name?: string;
  status: Status;
  completedAt?: Date;
  user: User;
  results?: Results[];
}
