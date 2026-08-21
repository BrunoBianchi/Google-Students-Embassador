import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

export type EventCoordinates = { lat: number; lng: number };
export type EventNews = { id: string; content: string; createdAt: Date; createdBy: ObjectId };
export type EventVisibility = "GLOBAL" | "CAMPUS";

@Entity({ name: "events" })
export class CommunityEvent {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  visibility: EventVisibility = "GLOBAL";

  @Column({ nullable: true })
  campusId?: ObjectId;


  @Column()
  startsAt!: Date;

  @Column({ nullable: true })
  endsAt?: Date;

  @Column()
  location!: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  coordinates?: EventCoordinates;

  @Column({ nullable: true })
  capacity?: number;

  @Column()
  imageUrls: string[] = [];

  @Column()
  tags: string[] = [];

  @Column()
  createdBy!: ObjectId;

  @Column()
  participantIds: ObjectId[] = [];

  @Column()
  organizerIds: ObjectId[] = [];

  @Column({ nullable: true })
  groupId?: ObjectId;

  @Column()
  groupIds: ObjectId[] = [];

  @Column({ nullable: true })
  forumId?: ObjectId;

  @Column()
  news: EventNews[] = [];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
