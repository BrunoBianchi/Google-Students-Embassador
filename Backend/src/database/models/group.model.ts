import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "groups" })
export class CommunityGroup {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  createdBy!: ObjectId;

  @Column()
  universityId!: ObjectId;

  @Column()
  memberIds: ObjectId[] = [];

  @Column()
  pendingMemberIds: ObjectId[] = [];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
