import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, PrimaryColumn, OneToOne, JoinTable, JoinColumn, ManyToOne, ManyToMany
} from "typeorm";
import { OptionsEnum } from "@interfaces/questions.interface";
import { TestEntity } from "@entities/test.entity";
import { QuestionEntity } from "@entities/questions.entity";
import { Results } from "@interfaces/results.interface";

@Entity("results")
export class ResultEntity extends BaseEntity implements Results {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: OptionsEnum, nullable: true })
  selected_option: OptionsEnum;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TestEntity, test => test.results)
  @JoinColumn({ name: "test_id" })
  test: TestEntity;

  @Column({type:"integer"})
  test_id: number;


  @ManyToOne(() => QuestionEntity)
  @JoinColumn({ name: "question_id" })
  question: QuestionEntity;

  @Column({type:"integer", unique: false})
  question_id: number;
}
