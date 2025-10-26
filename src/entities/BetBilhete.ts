import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bet_bilhetes')
export class BetBilhete {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  platform!: string;        // 'biahosted', 'fssb'

  @Column({ type: 'varchar', length: 100 })
  site!: string;            // 'lotogreen', 'mcgames', etc.

  @Column({ type: 'varchar', length: 36 })
  betAccountId!: string;    // FK para BetAccount

  @Column({ type: 'varchar', length: 36 })
  betBettingId!: string;    // FK para BetBetting

  @Column({ type: 'varchar', length: 100, nullable: true })
  bilheteId?: string;       // ID do bilhete na casa de aposta

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stake!: number;           // Valor apostado neste bilhete

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  odd!: number;             // Odd específica deste bilhete

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  potentialWin?: number;    // Ganho potencial (stake * odd)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualWin?: number;       // Ganho real após resultado

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceBefore!: number;   // Saldo antes da aposta

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  balanceAfter?: number;    // Saldo após a aposta

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'won', 'lost', 'cancelled', 'refunded'],
    default: 'pending'
  })
  status!: string;

  @Column({ type: 'json', nullable: true })
  betData?: any;           // Dados completos da aposta (seleções, mercados, etc.)

  @Column({ type: 'json', nullable: true })
  resultData?: any;        // Dados do resultado retornado pela casa

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;    // Mensagem de erro se houver

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
