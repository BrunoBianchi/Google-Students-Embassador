import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./models/user.model";
import { University } from "./models/university.model";
import { Campus } from "./models/campus.model";
import { CampusMember } from "./models/campus-member.model";
import { CommunityEvent } from "./models/event.model";
import { CommunityGroup } from "./models/group.model";
import { Forum } from "./models/forum.model";
import { ForumMessage } from "./models/message.model";
import { ServerSession } from "./models/session.model";
import { Announcement } from "./models/announcement.model";

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
  entities: [User, University, Campus, CampusMember, CommunityEvent, CommunityGroup, Forum, ForumMessage, ServerSession, Announcement],


  // MongoDB is schema-less. Letting TypeORM synchronize indexes causes it to
  // recreate an existing unique index under its generated name, which fails
  // on databases created by a previous version of the application.
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});
