# Extração do PDF (bootstrap)

Ferramenta de uso único / eventual. Extrai o texto do livro básico do Tormenta T20
para servir de **referência** ao implementar as regras (`src/rules`) e os dados
(`src/data`). **Não faz parte do app.**

## Como usar

1. Coloque o PDF (com texto selecionável) na raiz do projeto, ou tenha o caminho dele.
2. Rode:

   ```bash
   npm run extract-pdf -- "caminho/para/livro.pdf"
   # ou, se o PDF estiver na raiz do projeto:
   npm run extract-pdf
   ```

3. A saída vai para `scripts/extracted/`:
   - `pages/page-0001.txt` … — uma página por arquivo
   - `all.txt` — texto completo concatenado

> O conteúdo extraído e o próprio PDF são ignorados pelo git (ver `.gitignore`),
> pois são material protegido por direitos autorais.

## Quando rodar de novo

- Erratas oficiais do T20
- Expansões/novos livros que alterem regras ou adicionem conteúdo
