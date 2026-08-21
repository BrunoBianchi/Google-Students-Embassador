import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

export type CampusMemberRole = "STUDENT" | "AMBASSADOR" | "CAMPUS_ADMIN";
export type CampusMemberStatus = "ACTIVE" | "PENDING" | "BLOCKED";

@Entity({ name: "campus_members" })
export class CampusMember {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  userId!: ObjectId;

  @Column()
  campusId!: ObjectId;

  @Column()
  role: CampusMemberRole = "STUDENT";

  @Column()
  status: CampusMemberStatus = "ACTIVE";

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
