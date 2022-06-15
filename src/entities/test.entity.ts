import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne, Generated, OneToMany, BeforeInsert
} from "typeorm";
import { Tests as Test } from "@interfaces/test.interface";
import { UserEntity } from "@entities/users.entity";
import { ResultEntity } from "@entities/result.entity";

export enum Status {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

@Entity("tests")
export class TestEntity extends BaseEntity implements Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: Status, default: Status.PENDING })
  status: Status;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  completed_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.tests)
  user: UserEntity;

  @OneToMany(() => ResultEntity, results => results.test)
  results: ResultEntity[];

  @Column({default: 0})
  paid_for_test: number
}
