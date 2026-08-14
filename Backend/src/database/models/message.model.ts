import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from "typeorm";

@Entity({ name: "forum_messages" })
export class ForumMessage {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  forumId!: ObjectId;

  @Column()
  authorId!: ObjectId;

  @Column()
  content!: string;

  @Column({ nullable: true })
  parentMessageId?: ObjectId;

  @Column()
  likedByIds: ObjectId[] = [];

  @Column()
  mentionedUserIds: ObjectId[] = [];

  @Column({ nullable: true })
  deletedAt?: Date;

  @Column({ nullable: true })
  deletedBy?: "auto_moderator";

  @CreateDateColumn()
  createdAt!: Date;
}
