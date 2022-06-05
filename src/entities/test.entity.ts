import { IsNotEmpty } from "class-validator";
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne, RelationId
} from "typeorm";
import { Tests as Test } from "@interfaces/test.interface";
import { UserEntity } from "@entities/users.entity";

@Entity()
export class Tests extends BaseEntity implements Test {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => UserEntity, (user) => user.tests)
  user: UserEntity

  @Column()
  title: string;

  @RelationId((test: Tests) => test.user)
  user_id: number;

  @Column()
  image: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
