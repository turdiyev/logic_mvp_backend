import { User } from "@interfaces/users.interface";

export interface ITransaction {
  id?: number;
  paycom_transaction_id: string;
  paycom_time?: number;
  create_time: number;
  perform_time?: number;
  cancel_time?: number;
  amount: number;
  state: number;
  reason?: number;
  user?: User;
  receivers?: any;
}
