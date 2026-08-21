import { ObjectId } from "mongodb";
import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "campuses" })
export class Campus {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  name!: string;

  // Unique lowercase slug for public URL routing (e.g., 'unifei', 'usp', 'unicamp')
  @Column()
  slug!: string;

  @Column({ nullable: true })
  description?: string;

  // Normalized list of permitted institutional email domain strings (e.g. ['unifei.edu.br'])
  @Column()
  emailDomains: string[] = [];

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  region?: string;

  @Column()
  country: string = "BR";


  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  coverImageUrl?: string;

  @Column()
  isActive: boolean = true;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
