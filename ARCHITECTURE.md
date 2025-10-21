# 🎯 AutoBet Platform - Estrutura Atualizada

## 📋 Arquitetura de Plataformas

### **Biahosted como Plataforma Principal**
- **Plataforma**: Biahosted (infraestrutura principal)
- **Sites**: Lotogreen, McGames, EstrelaBet, Jogo de Ouro (interfaces diferentes)

### **Estrutura de Dados**

#### **Account (Contas do AutoBet)**
```typescript
{
  id: string;
  email: string;        // Email do usuário do AutoBet
  password: string;     // Senha do usuário do AutoBet
  name: string;
  isActive: boolean;
  lastLoginAt: Date;
  betAccounts: BetAccount[]; // Relacionamento 1:N
}
```

#### **BetAccount (Contas das Casas de Aposta)**
```typescript
{
  id: string;
  platform: string;    // 'biahosted' (plataforma principal)
  site: string;         // 'lotogreen', 'mcgames', etc.
  email: string;        // Email da conta da casa de aposta
  password: string;     // Senha da conta da casa de aposta
  siteUrl: string;      // https://lotogreen.bet.br
  balance: number;      // Saldo em centavos (900 = R$ 9,00)
  userId: string;       // ID do usuário na plataforma
  isActive: boolean;
  accountId: string;   // FK para Account
}
```

## 🔄 Fluxo de Autenticação

### **4 Etapas para Cada Site Biahosted:**

1. **Login** (`{siteUrl}/api/auth/login`)
   - Input: `email`, `password` da conta da casa de aposta
   - Output: `access_token` (TTL: 48h)

2. **Generate Token** (`{siteUrl}/api/generate-token`)
   - Input: `access_token` + `user_token` anterior
   - Output: `user_token` novo (TTL: 1h)

3. **Biahosted SignIn** (`sb2auth-altenar2.biahosted.com/api/WidgetAuth/SignIn`)
   - Input: `user_token`
   - Output: `accessToken` (TTL: 1h)

4. **Place Widget** (`sb2betgateway-altenar2.biahosted.com/api/widget/placeWidget`)
   - Input: `accessToken` + dados da aposta
   - Output: Resultado da aposta

## 🔑 Estrutura Redis com Prefixo "AutoBet"

```redis
# Tokens por conta de aposta
AutoBet:auth:access_token:{betAccountId}     # TTL: 48h
AutoBet:auth:user_token:{betAccountId}       # TTL: 1h  
AutoBet:auth:platform_token:{betAccountId}  # TTL: 1h

# Cache de dados da conta
AutoBet:account:balance:{betAccountId}       # TTL: 5min
AutoBet:account:profile:{betAccountId}       # TTL: 30min

# Sessões de usuário do AutoBet
AutoBet:session:{userId}                     # TTL: 24h

# Cache de mercados
AutoBet:markets:live:{site}                  # TTL: 30s
```

## 🏗️ Estrutura de Classes

### **BasePlatform** (Classe Abstrata)
- Métodos abstratos para login, generateToken, signIn, placeBet
- Métodos auxiliares para requisições HTTP
- Geração de IDs únicos para requisições

### **BiahostedPlatform** (Implementação Concreta)
- Implementa todos os métodos da BasePlatform
- Configurável por site (lotogreen, mcgames, etc.)
- URLs dinâmicas baseadas no site

### **PlatformFactory** (Factory Pattern)
- Cria instâncias de BiahostedPlatform para cada site
- Validação de sites suportados
- Configurações centralizadas

## 📊 Sites Suportados

| Site | URL | Integration |
|------|-----|-------------|
| Lotogreen | https://lotogreen.bet.br | lotogreen |
| McGames | https://mcgames.bet.br | mcgames |
| EstrelaBet | https://estrelabet.bet.br | estrelabet |
| Jogo de Ouro | https://jogodeouro.bet.br | jogodeouro |

## 🎯 Vantagens da Nova Estrutura

1. **Escalabilidade**: Fácil adição de novos sites Biahosted
2. **Manutenibilidade**: Código único para toda a plataforma Biahosted
3. **Flexibilidade**: Configuração por site mantendo a mesma lógica
4. **Performance**: Cache Redis otimizado com prefixo "AutoBet"
5. **Organização**: Separação clara entre plataforma e sites

## 🚀 Próximos Passos

1. ✅ Estrutura de plataformas definida
2. ✅ Entidades do banco criadas
3. ✅ Sistema Redis configurado
4. 🔄 Implementar APIs de autenticação
5. 📋 Criar dashboard de gerenciamento
6. 🤖 Implementar estratégias de apostas

---

**🎯 Objetivo**: Sistema unificado para gerenciar múltiplas contas em diferentes sites da plataforma Biahosted, com autenticação em cascata e cache inteligente.
