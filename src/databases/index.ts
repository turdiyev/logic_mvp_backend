import { join } from "path";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { ConnectionOptions } from "typeorm";
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, IS_LIVE } from "@config";

export const dbConnection: ConnectionOptions = {
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: false,
  logging: !IS_LIVE,
  entities: [join(__dirname, "../**/*.entity{.ts,.js}")],
  migrations: [join(__dirname, "../**/*.migration{.ts,.js}")],
  subscribers: [join(__dirname, "../**/*.subscriber{.ts,.js}")],
  cli: {
    entitiesDir: "src/entities",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  },
  namingStrategy: new SnakeNamingStrategy()
};
