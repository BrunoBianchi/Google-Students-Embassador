import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ObjectId } from "mongodb";

export type AnnouncementCategory = "GENERAL" | "FEATURE" | "EVENT" | "OPPORTUNITY" | "ACADEMIC";

@Entity("announcements")
export class Announcement {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({ default: "GLOBAL" })
  visibility!: "GLOBAL" | "CAMPUS";

  @Column({ nullable: true })
  campusId?: ObjectId;

  @Column({ default: "GENERAL" })
  category!: AnnouncementCategory;

  @Column()
  authorId!: ObjectId;

  @Column()
  authorName!: string;

  @Column({ default: false })
  isPinned!: boolean;

  @Column({ default: true })
  isPublished!: boolean;

  @Column()
  publishedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
