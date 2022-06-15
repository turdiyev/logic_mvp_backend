import { IsNotEmpty } from "class-validator";
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, OneToOne
} from "typeorm";
import { OptionsEnum, Questions as IQuestions, TypeEnum } from "@interfaces/questions.interface";
import { UserEntity } from "@entities/users.entity";
import { TestEntity } from "@entities/test.entity";
import { ResultEntity } from "@entities/result.entity";

@Entity("questions")
export class QuestionEntity extends BaseEntity implements IQuestions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  number: number;

  @Column({ type: "enum", enum: OptionsEnum })
  correct_answer: OptionsEnum;

  @Column({ type: "enum", enum: TypeEnum, default: TypeEnum.PAID })
  type: TypeEnum;

  @Column({ unique: true })
  public_code: string;

  @Column()
  test_code: string;

  @Column()
  image: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => UserEntity, (user) => user.questions)
  user: UserEntity;


  @OneToMany(() => ResultEntity, (result) => result.question)
  results: ResultEntity[];
}
