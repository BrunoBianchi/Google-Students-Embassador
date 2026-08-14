import { Column, CreateDateColumn, Entity, ObjectIdColumn } from "typeorm";
import { ObjectId } from "mongodb";

@Entity({ name: "universities" })
export class University {
  @ObjectIdColumn()
  _id!: ObjectId;

  // Stored in lowercase and indexed uniquely to avoid duplicate institutions.
  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
