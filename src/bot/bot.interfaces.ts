// Define your own context type
import { Context, Telegraf } from "telegraf";
import LocalSession from "telegraf-session-local";

export interface MyContext extends Context {
  myProp?: string;
  myOtherProp?: number;
  session?: any;
}

export type Bot = Telegraf<MyContext>
