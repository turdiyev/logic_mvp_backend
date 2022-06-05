export interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  first_name?: string;
  last_name?: string;
  json_data?: string | object;
  telegram_user_id: number;
}
