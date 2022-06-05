// Define your own context type
import { Context } from "telegraf";

export interface MyContext extends Context {
  myProp?: string;
  myOtherProp?: number;
}
