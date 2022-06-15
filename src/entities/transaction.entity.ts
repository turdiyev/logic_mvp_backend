import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn
} from "typeorm";
import { UserEntity } from "@entities/users.entity";
import { ITransaction } from "@interfaces/transaction.interface";

@Entity("transactions")
export class TransactionEntity extends BaseEntity implements ITransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  paycom_transaction_id: string;

  @Column({ type: "bigint", nullable: true, default: 0 })
  paycom_time: number;

  @Column({ type: "bigint", default: 0 })
  create_time: number;

  @Column({ type: "bigint", nullable: true, default: 0 })
  perform_time: number;

  @Column({ type: "bigint", nullable: true, default: 0 })
  cancel_time: number;

  @Column({ default: 0 })
  amount: number;

  @Column()
  state: number;

  @Column({ nullable: true })
  reason: number;

  @Column({ type: "jsonb", default: "[]" })
  receivers: any;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserEntity, test => test.transactions)
  @JoinColumn()
  user: UserEntity;
}
