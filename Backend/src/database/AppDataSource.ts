import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./models/user.model";
import { University } from "./models/university.model";
import { CommunityEvent } from "./models/event.model";
import { CommunityGroup } from "./models/group.model";
import { Forum } from "./models/forum.model";
import { ForumMessage } from "./models/message.model";
import { ServerSession } from "./models/session.model";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "A variável MONGODB_URI não foi definida. Configure-a no arquivo .env antes de iniciar a API.",
  );
}

export const AppDataSource = new DataSource({
  type: "mongodb",
  url: mongoUri,
  database: process.env.MONGODB_DB,
  entities: [User, University, CommunityEvent, CommunityGroup, Forum, ForumMessage, ServerSession],
  // MongoDB is schema-less. Letting TypeORM synchronize indexes causes it to
  // recreate an existing unique index under its generated name, which fails
  // on databases created by a previous version of the application.
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});
