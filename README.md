# AutoBet - Gestão Inteligente de Apostas

Uma plataforma moderna para gerenciar suas contas de apostas de forma automatizada e inteligente.

## 🚀 Funcionalidades Implementadas

### ✅ **Sistema de Autenticação Completo**
- **Login e Registro:** Páginas modernas com validação em tempo real
- **JWT Authentication:** Tokens seguros com expiração de 7 dias
- **Hook de Autenticação:** `useAuth` para gerenciar estado global
- **Middleware de Segurança:** Verificação automática de tokens

### ✅ **Interface Moderna**
- **Design Responsivo:** Inspirado no Betao com gradientes e cores modernas
- **Header Dinâmico:** Navegação baseada no status de autenticação
- **Página Inicial:** Hero section, features, plataformas suportadas
- **Componentes Reutilizáveis:** Cards, botões, formulários estilizados

### ✅ **Arquitetura Robusta**
- **Next.js 15:** App Router com TypeScript
- **Tailwind CSS:** Estilização moderna e responsiva
- **TypeORM:** Entidades prontas para banco de dados
- **Estrutura Modular:** Separação clara de responsabilidades

## 🛠 **Tecnologias Utilizadas**

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, JWT, bcryptjs
- **Banco de Dados:** TypeORM, MySQL (configuração pronta)
- **Ícones:** Lucide React
- **Cache:** Redis (configuração pronta)

## 📋 **Próximas Funcionalidades**

- [ ] Página de detalhes da conta
- [ ] Página para registrar contas de apostas
- [ ] Página para gerenciar contas com botão conectar
- [ ] Funcionalidade de login automático em todas as contas
- [ ] Dashboard com estatísticas
- [ ] Sistema de estratégias automatizadas

## 🚀 **Como Executar**

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `env.example` para `.env` e configure:

```env
# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=autobet

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Next.js Configuration
NODE_ENV=development
```

### 3. Configurar Banco de Dados MySQL (Opcional)
Para usar TypeORM com MySQL:

```bash
# Instalar MySQL
# Criar banco de dados 'autobet'
mysql -u root -p < database-setup.sql

# Executar migrations e criar usuário de teste
npm run setup-db
```

**📚 Para mais detalhes sobre migrations, consulte [MIGRATIONS.md](./MIGRATIONS.md)**

### 4. Executar Aplicação
```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🔐 **Credenciais de Teste**

**Usuário Padrão:**
- Email: `teste@teste.com`
- Senha: `123456`

## 📁 **Estrutura do Projeto**

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/auth/          # Endpoints de autenticação
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   └── layout/           # Header, Footer
├── hooks/                # Hooks personalizados
│   └── useAuth.tsx       # Hook de autenticação
├── lib/                  # Utilitários e configurações
│   ├── entities/         # Entidades TypeORM
│   ├── auth.ts          # Middleware de autenticação
│   ├── database.ts      # Configuração do banco
│   └── db-init.ts       # Inicialização do banco
└── types/                # Definições TypeScript
```

## 🔄 **Migração para TypeORM**

Atualmente a aplicação usa dados mock para desenvolvimento. Para migrar para TypeORM:

1. **Configure o MySQL** e execute `npm run init-db`
2. **Substitua os endpoints** em `/api/auth/` para usar TypeORM
3. **Remova os dados mock** e use as entidades reais

### Endpoints Prontos para TypeORM:
- `src/app/api/auth/login/route.ts` - Login com TypeORM
- `src/app/api/auth/register/route.ts` - Registro com TypeORM  
- `src/app/api/auth/me/route.ts` - Verificação de token com TypeORM

## 🎨 **Design System**

### Cores Principais:
- **Primary:** Blue (600-700)
- **Secondary:** Purple (600-700)
- **Success:** Green (600-700)
- **Warning:** Yellow (600-700)
- **Error:** Red (600-700)

### Componentes:
- **Cards:** `.card`, `.card-hover`
- **Botões:** `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`
- **Formulários:** `.form-input`, `.form-label`, `.form-error`
- **Status:** `.status-active`, `.status-inactive`, `.status-pending`, `.status-error`

## 📱 **Responsividade**

A aplicação é totalmente responsiva com breakpoints:
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🔒 **Segurança**

- **Senhas:** Hash com bcryptjs (12 rounds)
- **Tokens:** JWT com expiração de 7 dias
- **Validação:** Validação de entrada em todos os endpoints
- **CORS:** Configuração adequada para produção

## 📈 **Performance**

- **Next.js 15:** Turbopack para builds rápidos
- **Static Generation:** Páginas estáticas quando possível
- **Code Splitting:** Carregamento otimizado de componentes
- **Image Optimization:** Otimização automática de imagens

---

**Desenvolvido com ❤️ para revolucionar o gerenciamento de apostas**