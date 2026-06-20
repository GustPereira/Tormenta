// @ts-check
/**
 * Script de bootstrap — baixa o Google Sheets da ficha (export xlsx) e despeja
 * cada aba (inclusive as escondidas) em CSV/JSON, para servir de REFERÊNCIA ao
 * construir os arquivos de dados (src/data) e a UI.
 *
 * NÃO faz parte do build do app. Roda manualmente no início e quando a planilha
 * de referência mudar.
 *
 * Uso:
 *   npm run extract-sheet                         (usa o SHEET_ID padrão abaixo)
 *   npm run extract-sheet -- <id-da-planilha>
 *
 * Saída: scripts/extracted-sheet/
 *   - source.xlsx            (cópia bruta baixada)
 *   - sheets.json            (índice: nome, escondida?, linhas, colunas)
 *   - <aba>.csv              (uma por aba)
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as XLSX from 'xlsx'

const DEFAULT_SHEET_ID = '142vy9A0dSUSkaqLSfpZWpbS9tAD-8vThtegjToIZhz0'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'extracted-sheet')
const xlsxPath = join(outDir, 'source.xlsx')

const HIDDEN_LABEL = { 0: 'visível', 1: 'escondida', 2: 'muito escondida' }

function safeName(name) {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase() || 'aba'
}

async function downloadXlsx(id) {
  const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Falha ao baixar a planilha (HTTP ${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf[0] !== 0x50 || buf[1] !== 0x4b) {
    throw new Error(
      'O export não retornou um xlsx. A planilha precisa estar compartilhada como "qualquer pessoa com o link".',
    )
  }
  return buf
}

async function main() {
  const id = process.argv[2] || DEFAULT_SHEET_ID
  mkdirSync(outDir, { recursive: true })

  let buf
  if (existsSync(xlsxPath)) {
    console.log('Usando cópia local:', xlsxPath)
    buf = readFileSync(xlsxPath)
  } else {
    console.log('Baixando planilha…')
    buf = await downloadXlsx(id)
    writeFileSync(xlsxPath, buf)
  }

  const wb = XLSX.read(buf, { type: 'buffer' })
  const hiddenInfo = Object.fromEntries(
    (wb.Workbook?.Sheets ?? []).map((s) => [s.name, s.Hidden ?? 0]),
  )

  const index = []
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false })
    const ref = ws['!ref'] || 'A1'
    const range = XLSX.utils.decode_range(ref)
    const rows = range.e.r - range.s.r + 1
    const cols = range.e.c - range.s.c + 1
    const file = `${safeName(name)}.csv`
    writeFileSync(join(outDir, file), csv, 'utf8')
    const hidden = hiddenInfo[name] ?? 0
    index.push({ name, file, hidden: HIDDEN_LABEL[hidden], rows, cols })
  }

  writeFileSync(join(outDir, 'sheets.json'), JSON.stringify(index, null, 2), 'utf8')

  console.log(`\n${index.length} abas extraídas em ${outDir}:`)
  for (const s of index) {
    console.log(`  [${s.hidden.padEnd(15)}] ${s.name.padEnd(28)} ${s.rows}x${s.cols} -> ${s.file}`)
  }
}

main().catch((err) => {
  console.error('Falha:', err.message)
  process.exit(1)
})
