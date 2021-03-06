import { IsNotEmpty } from "class-validator";
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn, OneToMany, JoinColumn
} from "typeorm";
import { User } from "@interfaces/users.interface";
import { QuestionEntity } from "@entities/questions.entity";
import { TestEntity } from "@entities/test.entity";

@Entity('users')
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Unique(["telegram_user_id"])
  telegram_user_id: number;

  @Column({ nullable: true })
  @Unique(["email"])
  email: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  username: string;

  @Column({ default: "Test_2@22" })
  password: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  balance: number;

  @Column({ type: "json", nullable: true })
  json_data: string | object;

  @OneToMany(() => QuestionEntity, question => question.user)
  @JoinColumn()
  questions: QuestionEntity[];

  @OneToMany(() => TestEntity, test => test.user)
  tests: TestEntity[];
}
