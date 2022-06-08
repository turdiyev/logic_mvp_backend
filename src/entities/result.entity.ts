import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, PrimaryColumn, OneToOne, JoinTable, JoinColumn
} from "typeorm";
import { OptionsEnum } from "@interfaces/questions.interface";
import { TestEntity } from "@entities/test.entity";
import { QuestionEntity } from "@entities/questions.entity";
import { Results } from "@interfaces/results.interface";

@Entity("results")
export class ResultEntity extends BaseEntity implements Results{
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ type: "int" })
  test_id: number;

  @PrimaryColumn({ type: "int" })
  question_id: number;

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
