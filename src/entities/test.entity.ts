import { IsNotEmpty } from "class-validator";
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Options, Question } from "@interfaces/questions.interface";

@Entity()
export class Questions extends BaseEntity implements Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  number: string;

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
}
