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
import { TransactionEntity } from "@entities/transaction.entity";
import { parseToTiyin } from "@utils/paymentUtils";
import { ONE_TEST_PRICE } from "@config";

@Entity("users")
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint", unique: true })
  telegram_user_id: number;

  @Column({ type: "bigint", unique: true, nullable: true })
  account_number: number;

  @Column({ nullable: true })
  @Unique(["email"])
  email: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  username: string;

  @Column({ default: "Test_2@22", select: false })
  password: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: parseToTiyin(ONE_TEST_PRICE) })
  initial_balance: number;

  @Column({ type: "json", nullable: true, select:false })
  json_data: string | object;

  @OneToMany(() => QuestionEntity, question => question.user)
  @JoinColumn()
  questions: QuestionEntity[];

  @OneToMany(() => TestEntity, test => test.user)
  tests: TestEntity[];

  @OneToMany(() => TransactionEntity, transaction => transaction.user)
  transactions: TransactionEntity[];
}
