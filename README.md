<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# OTIS SmartFlow — Gestão Inteligente de Elevadores

Plataforma completa para gestão de chamados, técnicos em campo, contratos, manutenção preventiva/preditiva e inteligência operacional para elevadores OTIS.

## 🚀 Como Rodar Localmente

**Pré-requisitos:** Node.js (v18+)

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000` no seu navegador.

---

## 🌐 Deploy no Vercel

O projeto já está 100% configurado com [`vercel.json`](vercel.json), rotas SPA e otimização de chunks do Vite.

### Opção 1: Via GitHub (Recomendado)
1. Suba este projeto para um repositório no seu GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit ready for vercel"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e faça login.
3. Clique em **"Add New..."** > **"Project"**.
4. Importe o repositório do GitHub.
5. As configurações são detectadas automaticamente:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Clique em **Deploy**.

---

### Opção 2: Via Vercel CLI
1. Instale o CLI da Vercel (se ainda não tiver):
   ```bash
   npm i -g vercel
   ```
2. No diretório do projeto, execute:
   ```bash
   vercel
   ```
3. Siga as instruções no terminal para publicar diretamente. Para produção:
   ```bash
   vercel --prod
   ```

