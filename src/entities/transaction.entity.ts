import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne
} from "typeorm";
import { UserEntity } from "@entities/users.entity";
import { ITransaction } from "@interfaces/transaction.interface";

@Entity("transactions")
export class TransactionEntity extends BaseEntity implements ITransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  paycom_transaction_id: string;

  @Column({ type: "bigint", nullable: true })
  paycom_time: number;

  @Column({ type: "bigint" })
  create_time: number;

  @Column({ type: "bigint", nullable: true })
  perform_time: number;

  @Column({ type: "bigint", nullable: true })
  cancel_time: number;

  @Column({ default: 0 })
  amount: number;

  @Column()
  state: number;

  @Column({ nullable: true })
  reason: number;

  @Column({ type: "jsonb", default:'[]' })
  receivers: any;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, test => test.transactions)
  user: UserEntity;
}
