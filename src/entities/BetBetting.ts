import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bet_bettings')
export class BetBetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  accountId!: string;      // FK para Account (usuário do AutoBet)

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;     // Descrição da estratégia/aposta

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stakeTotal!: number;     // Stake total investido em todas as contas

  @Column({ type: 'decimal', precision: 8, scale: 3 })
  averageOdd!: number;     // Odd média de todos os bilhetes

  @Column({ type: 'int' })
  totalBilhetes!: number;  // Quantidade total de bilhetes criados

  @Column({ type: 'int' })
  successfulBilhetes!: number; // Bilhetes criados com sucesso

  @Column({ type: 'int' })
  failedBilhetes!: number; // Bilhetes que falharam

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPotentialWin?: number; // Ganho potencial total

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalActualWin?: number;   // Ganho real total

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  profitLoss?: number;       // Lucro/Prejuízo final

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'completed', 'partial', 'failed'],
    default: 'pending'
  })
  status!: string;

  @Column({ type: 'json', nullable: true })
  betConfig?: any;         // Configuração da aposta (mercados, seleções, etc.)

  @Column({ type: 'json', nullable: true })
  summary?: any;           // Resumo dos resultados por plataforma

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
