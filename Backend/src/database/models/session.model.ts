import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "sessions" })
export class ServerSession {
  @ObjectIdColumn()
  _id!: ObjectId;

  // The unique MongoDB index is created explicitly at application startup.
  @Column()
  tokenHash!: string;

  @Column()
  userId!: ObjectId;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
