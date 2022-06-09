import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, Generated, JoinColumn, OneToOne, OneToMany
} from "typeorm";
import { Tests as Test } from "@interfaces/test.interface";
import { UserEntity } from "@entities/users.entity";
import { QuestionEntity } from "@entities/questions.entity";
import { ResultEntity } from "@entities/result.entity";

export enum Status {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

@Entity("tests")
export class TestEntity extends BaseEntity implements Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", unique: true })
  @Generated("uuid")
  name: string;

  @Column({ type: "enum", enum: Status, default: Status.PENDING })
  status: Status;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.tests)
  user: UserEntity;

  @OneToMany(() => ResultEntity, results => results.test)
  results: ResultEntity[];

}
