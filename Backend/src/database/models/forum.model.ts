import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

export type ForumRole = "owner" | "admin" | "moderator" | "member";
export type ForumMemberAccess = {
  role: Exclude<ForumRole, "owner">;
  mutedUntil?: Date;
  readOnly?: boolean;
  bannedAt?: Date;
};

@Entity({ name: "forums" })
export class Forum {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  createdBy!: ObjectId;

  @Column()
  memberIds: ObjectId[] = [];

  @Column()
  memberAccess: Record<string, ForumMemberAccess> = {};

  @Column()
  isPrivate = false;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
