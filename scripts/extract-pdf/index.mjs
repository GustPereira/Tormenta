// @ts-check
/**
 * Script de bootstrap — extrai o texto de um PDF (o livro básico do Tormenta T20)
 * para arquivos de texto que servem de REFERÊNCIA ao implementar as regras em
 * src/rules e os dados em src/data.
 *
 * NÃO faz parte do build do app. Roda manualmente no início do projeto e quando
 * o sistema receber erratas/expansões.
 *
 * Uso:
 *   npm run extract-pdf -- "caminho/para/livro.pdf"
 *   npm run extract-pdf                 (procura o primeiro *.pdf na raiz do projeto)
 *
 * Saída: scripts/extracted/
 *   - pages/page-0001.txt ...   (uma página por arquivo)
 *   - all.txt                   (texto completo concatenado)
 */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..', '..')
const outDir = join(__dirname, '..', 'extracted')
const pagesDir = join(outDir, 'pages')

function findPdf() {
  const fromArg = process.argv[2]
  if (fromArg) {
    const p = resolve(fromArg)
    if (!existsSync(p)) {
      console.error(`PDF não encontrado: ${p}`)
      process.exit(1)
    }
    return p
  }
  const pdfs = readdirSync(projectRoot).filter((f) => f.toLowerCase().endsWith('.pdf'))
  if (pdfs.length === 0) {
    console.error(
      'Nenhum PDF informado e nenhum *.pdf encontrado na raiz do projeto.\n' +
        'Coloque o PDF na pasta do projeto ou passe o caminho:\n' +
        '  npm run extract-pdf -- "caminho/para/livro.pdf"',
    )
    process.exit(1)
  }
  return join(projectRoot, pdfs[0])
}

/** Junta os itens de texto de uma página, inserindo quebras de linha por posição Y. */
function itemsToText(items) {
  let text = ''
  let lastY = null
  for (const item of items) {
    if (!('str' in item)) continue
    const y = item.transform?.[5]
    if (lastY !== null && y !== undefined && Math.abs(y - lastY) > 1) {
      text += '\n'
    }
    text += item.str
    if (item.hasEOL) text += '\n'
    lastY = y
  }
  return text
}

async function main() {
  const pdfPath = findPdf()
  console.log(`Extraindo: ${pdfPath}`)

  // Build legacy (Node) do pdfjs.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  const { readFileSync } = await import('node:fs')
  const data = new Uint8Array(readFileSync(pdfPath))
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise

  mkdirSync(pagesDir, { recursive: true })

  const allParts = []
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n)
    const content = await page.getTextContent()
    const text = itemsToText(content.items)
    const padded = String(n).padStart(4, '0')
    writeFileSync(join(pagesDir, `page-${padded}.txt`), text, 'utf8')
    allParts.push(`\n\n===== PÁGINA ${n} =====\n\n${text}`)
    if (n % 25 === 0 || n === doc.numPages) {
      console.log(`  ${n}/${doc.numPages} páginas`)
    }
  }

  writeFileSync(join(outDir, 'all.txt'), allParts.join(''), 'utf8')
  console.log(`Concluído. ${doc.numPages} páginas em ${outDir}`)
}

main().catch((err) => {
  console.error('Falha na extração:', err.message)
  process.exit(1)
})
