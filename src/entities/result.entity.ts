import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, PrimaryColumn, OneToOne, JoinTable
} from "typeorm";
import { OptionsEnum } from "@interfaces/questions.interface";
import { TestEntity } from "@entities/test.entity";
import { QuestionEntity } from "@entities/questions.entity";

@Entity("results")
export class ResultEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ type: "int" })
  tests_id: number;

  @PrimaryColumn({ type: "int" })
  questions_id: number;

  @Column({ type: "enum", enum: OptionsEnum, nullable:true })
  selected_option: OptionsEnum;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => TestEntity)
  @JoinTable()
  test: TestEntity;

  @OneToOne(() => QuestionEntity)
  @JoinTable()
  question: QuestionEntity;
}
