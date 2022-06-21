import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const PAGE_LIMIT = 15; // One test price
export const ONE_TEST_PRICE = 20000; // One test price
export const DATE_FORMAT = "DD.MM.YYYY";
export const DATE_TIME_FORMAT = "DD.MM.YYYY HH:mm:ss";
export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const IS_LIVE = process.env.NODE_ENV === "production";
export const {
  NODE_ENV,
  PORT, DB_HOST, DB_PORT,
  DB_USER, DB_PASSWORD, DB_DATABASE,
  SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN
} = process.env;
