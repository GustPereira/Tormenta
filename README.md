# Ficha Online — Tormenta T20

Ficha de personagem online para o RPG **[Tormenta T20](https://jamboeditora.com.br/tormenta20/)**.
Crie e mantenha várias fichas direto no navegador, com cálculos automáticos das
regras (perícias, defesa, PV/PM) e import/export em JSON.

🔗 **Acesse:** https://GustPereira.github.io/Tormenta/

> ℹ️ **Use à vontade!** Este projeto é aberto e qualquer pessoa pode usar a ficha
> livremente — basta acessar o link acima. Não precisa instalar nada nem criar conta.
>
> 🎓 **Projeto de aprendizagem.** Estou desenvolvendo este app como forma de estudo
> (React, TypeScript e ferramentas modernas de front-end). Por isso ele está em
> evolução constante e pode conter coisas a melhorar — sugestões e feedback são
> muito bem-vindos!

## ✨ Funcionalidades

- **Várias fichas**, salvas localmente no navegador (IndexedDB) — não precisa de login.
- **Import / Export em JSON** para backup e para transferir fichas entre dispositivos.
- **Cálculos automáticos** das regras do T20 (perícias, Defesa, PV/PM, deslocamento,
  proficiências) a partir das suas escolhas de atributos, raça, origem e classe.
- **Ficha de página única** com atributos, vitais & defesa, perícias, ataques,
  habilidades, magias por círculo, inventário e anotações.
- **100% no navegador** — seus dados ficam só no seu dispositivo.

> Os dados das suas fichas são gravados **apenas localmente** no seu navegador.
> Limpar os dados do site apaga as fichas — use o **Exportar JSON** para fazer backup.

## 🛠️ Tecnologias

React • TypeScript • Vite • Tailwind CSS • Dexie (IndexedDB) • Zod • Zustand •
React Router • Vitest

## 🚀 Rodando localmente

Pré-requisito: **Node.js 22+**.

```bash
npm install      # instala as dependências
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # build de produção (gera ./dist)
npm run preview  # pré-visualiza o build
npm run test     # roda os testes (Vitest)
```

## 🗂️ Estrutura

```
src/
  data/        catálogos do T20 (perícias, classes, raças, origens…)
  rules/       motor de regras puro (cálculos derivados) — com testes
  schema/      tipo Character + validação (Zod) + migração de versões
  db/          persistência local (Dexie/IndexedDB) + CRUD de fichas
  io/          import/export de fichas em JSON
  store/       estado da ficha em edição (Zustand) + autosave
  features/    seções da ficha (atributos, perícias, magias, inventário…)
  components/  componentes de UI reutilizáveis
  pages/       lista de fichas e editor
scripts/       ferramentas de bootstrap (não fazem parte do app):
  extract-pdf/   extrai texto do livro básico (referência de regras)
  extract-sheet/ baixa a planilha de referência e dumpa as abas
  build-data/    gera os JSON de dados a partir da planilha
```

## 📦 Deploy

O deploy é automático via **GitHub Actions** (`.github/workflows/deploy.yml`):
todo push na branch `main` builda o projeto e publica no **GitHub Pages**.

O `base` do Vite é `/Tormenta/` no build (subcaminho do GitHub Pages). Se o
repositório for renomeado, atualize o `base` em `vite.config.ts`.

## ⚖️ Aviso

Tormenta 20 é propriedade da **Jambô Editora**. Este é um projeto **não oficial**,
feito por fã e sem fins lucrativos, com fins de estudo. As regras implementadas
servem apenas para automatizar o preenchimento da ficha; nenhum conteúdo dos
livros é redistribuído por este repositório.
