import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bet_accounts')
export class BetAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  platform!: string; // 'biahosted' (plataforma principal)

  @Column({ type: 'varchar', length: 100 })
  site!: string; // 'lotogreen', 'mcgames', 'estrelabet', etc. (site específico)

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string; // Será hash da senha

  @Column({ type: 'varchar', length: 500 })
  siteUrl!: string; // https://lotogreen.bet.br

  @Column({ type: 'int', default: 0 })
  balance!: number; // Saldo em centavos (ex: 1113 = R$ 11,13)

  @Column({ type: 'varchar', length: 100, nullable: true })
  userId?: string; // ID do usuário na plataforma

  @Column({ type: 'text', nullable: true })
  accessToken?: string; // Token de acesso da plataforma

  @Column({ type: 'text', nullable: true })
  userToken?: string; // Token do usuário

  @Column({ type: 'text', nullable: true })
  platformToken?: string; // Token da plataforma para operações

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastBalanceUpdate?: Date;

  @Column({ type: 'datetime', nullable: true })
  lastTokenRefresh?: Date;

  @Column({ type: 'varchar', length: 36 })
  accountId!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
