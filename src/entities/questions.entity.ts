import { IsNotEmpty } from "class-validator";
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany
} from "typeorm";
import { Options, Questions as IQuestions } from "@interfaces/questions.interface";
import { UserEntity } from "@entities/users.entity";

@Entity()
export class Questions extends BaseEntity implements IQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  number: number;

  @Column({ type: "enum", enum: Options })
  correct_answer: Options;

  @Column()
  origin_test_name: string;

  @Column()
  image: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany((type) => UserEntity, (user) => user.questions)
  user: UserEntity[]
}
