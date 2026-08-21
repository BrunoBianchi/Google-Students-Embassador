import { ObjectId } from "mongodb";
import { BeforeInsert, Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

export type UserType = "ambassador" | "student";
export type AvatarFrame = "none" | "google" | "gold" | "rainbow" | "campus" | "gemini" | "orbit" | "pixel" | "network" | "constellation" | "chrome" | "android" | "cloud" | "firebase" | "maps" | "codejam" | "community" | "prism" | "devfest" | "studio" | "spark" | "material" | "heart" | "applause" | "comet" | "aura" | "mosaic";
export type EmailPreferences = { eventUpdates: boolean; forumUpdates: boolean; productUpdates: boolean };
export type AuthProvider = "password" | "google";

export type AmbassadorPrivacySettings = {
  isPublic?: boolean;
  showCampus?: boolean;
  showRegion?: boolean;
  showCourse?: boolean;
  showBio?: boolean;
  showSocialLinks?: boolean;
};

@Entity({ name: "users" })
export class User {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  name!: string;

  // The unique MongoDB index is created explicitly at application startup.
  // Keeping `unique` in TypeORM metadata makes it try to rename legacy indexes.
  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  googleSubject?: string;

  @Column()
  authProviders: AuthProvider[] = ["password"];

  @BeforeInsert()
  async hashPassword() {
    this.password = await Bun.password.hash(this.password);
  }

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  course?: string;

  @Column()
  birth!: Date;

  @Column()
  state!: string;

  @Column()
  city!: string;

  @Column({ nullable: true })
  region?: string;

  @Column()
  userType!: UserType;

  @Column()
  universityId!: ObjectId;

  @Column({ nullable: true })
  groupCode?: string;

  // The public code is unique per ambassador, while the number lets us
  // aggregate the ten national ambassador groups without exposing a member's
  // personal code in the map or directory.
  @Column({ nullable: true })
  groupNumber?: number;

  @Column({ nullable: true })
  avatarPath?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  linkedinUrl?: string;

  @Column({ nullable: true })
  instagramUrl?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  privacySettings?: AmbassadorPrivacySettings;

  @Column()
  avatarFrame: AvatarFrame = "none";


  @Column({ nullable: true })
  inviteCode?: string;

  @Column({ nullable: true })
  referredById?: ObjectId;

  @Column()
  likes = 0;

  @Column()
  likedByIds: ObjectId[] = [];

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  emailVerificationTokenHash?: string;

  @Column({ nullable: true })
  emailVerificationExpiresAt?: Date;

  @Column({ nullable: true })
  passwordResetTokenHash?: string;

  @Column({ nullable: true })
  passwordResetExpiresAt?: Date;

  @Column({ nullable: true })
  emailPreferenceToken?: string;

  @Column({ nullable: true })
  termsAcceptedAt?: Date;

  @Column({ nullable: true })
  privacyAcceptedAt?: Date;

  @Column()
  emailPreferences: EmailPreferences = { eventUpdates: true, forumUpdates: true, productUpdates: true };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
