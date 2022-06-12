export interface User {
  id: number;
  account_number: number;
  initial_balance?: number;
  email: string;
  password: string;
  username: string;
  first_name?: string;
  last_name?: string;
  json_data?: string | object;
  telegram_user_id: number;
}
