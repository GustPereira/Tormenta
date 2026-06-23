// @ts-check
/**
 * Codegen — transforma o CSV bruto da planilha (scripts/extracted-sheet/ficha_base.csv)
 * em arquivos JSON de dados do app, em src/data/generated/.
 *
 * Roda após `npm run extract-sheet`. NÃO faz parte do build do app.
 *
 * Uso: npm run build-data
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const csvPath = join(__dirname, '..', 'extracted-sheet', 'ficha_base.csv')
const outDir = join(__dirname, '..', '..', 'src', 'data', 'generated')

/** Mapeia o nome de raça da planilha para o id usado em src/data/races.ts. */
const RACE_NAME_TO_ID = {
  Humano: 'humano',
  Anão: 'anao',
  Dahllan: 'dahllan',
  Elfo: 'elfo',
  Goblin: 'goblin',
  Lefou: 'lefou',
  Minotauro: 'minotauro',
  Qareen: 'qareen',
  Golem: 'golem',
  Hynne: 'hynne',
  Kliren: 'kliren',
  Medusa: 'medusa',
  Osteon: 'osteon',
  'Sereia/Tritão': 'sereia-tritao',
  Sílfide: 'silfide',
  'Suraggel - Aggelus': 'suraggel-aggelus',
  'Suraggel - Sulfure': 'suraggel-sulfure',
  Trog: 'trog',
}

function parseCSV(text) {
  const rows = []
  let row = [],
    cur = '',
    q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"'
          i++
        } else q = false
      } else cur += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(cur)
      cur = ''
    } else if (c === '\n') {
      row.push(cur)
      rows.push(row)
      row = []
      cur = ''
    } else if (c !== '\r') cur += c
  }
  if (cur.length || row.length) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function num(v) {
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function main() {
  const g = parseCSV(readFileSync(csvPath, 'utf8'))
  const at = (r, c) => (g[r] && g[r][c] != null ? g[r][c].trim() : '')

  // Perícias treinadas concedidas por cada origem, lidas da Tabela 1-19 do PDF
  // (texto antes do ";"). Cobre as origens do Livro Básico.
  const SKILL_IDS = new Set([
    'acrobacia', 'adestramento', 'atletismo', 'atuacao', 'cavalgar', 'conhecimento',
    'cura', 'diplomacia', 'enganacao', 'fortitude', 'furtividade', 'guerra', 'iniciativa',
    'intimidacao', 'intuicao', 'investigacao', 'jogatina', 'ladinagem', 'luta', 'misticismo',
    'nobreza', 'oficio', 'percepcao', 'pilotagem', 'pontaria', 'reflexos', 'religiao',
    'sobrevivencia', 'vontade',
  ])
  let pdfText = ''
  for (const p of ['0093', '0094']) {
    const fp = join(__dirname, '..', 'extracted', 'pages', `page-${p}.txt`)
    if (existsSync(fp)) pdfText += ' ' + readFileSync(fp, 'utf8')
  }
  pdfText = pdfText.replace(/\s+/g, ' ')
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  function originSkills(name) {
    if (!pdfText) return []
    const m = new RegExp(escapeRe(name) + '\\s+([^;]*?);').exec(pdfText)
    if (!m) return []
    const skills = []
    for (const tok of m[1].split(',')) {
      const id = slug(tok.replace(/\(.*?\)/g, ''))
      if (SKILL_IDS.has(id)) {
        if (!skills.includes(id)) skills.push(id)
      } else break
    }
    return skills
  }

  // ----- ORIGENS (c135 nome, c137 poder, c146 itens; perícias do PDF) -----
  const origins = []
  for (let r = 1; r < g.length; r++) {
    const name = at(r, 135)
    if (!name || name === '-' || name === 'ORIGEM') continue
    origins.push({
      id: slug(name),
      name,
      power: at(r, 137) || null,
      items: at(r, 146) || null,
      pericasFixas: originSkills(name),
      pericasEscolha: 0,
    })
  }

  // ----- TRAÇOS DE RAÇA (c117 nome, c125-133) -----
  const raceTraits = []
  for (let r = 1; r < g.length; r++) {
    const name = at(r, 117)
    if (!RACE_NAME_TO_ID[name]) continue
    raceTraits.push({
      id: RACE_NAME_TO_ID[name],
      name,
      deslocamento: num(at(r, 125)),
      visaoPenumbra: num(at(r, 126)) > 0,
      visaoEscuro: num(at(r, 127)) > 0,
      faro: num(at(r, 128)) > 0,
      tipo: at(r, 132).replace(/[()]/g, ''),
      tamanho: at(r, 133),
    })
  }

  // ----- PROFICIÊNCIAS DE CLASSE (c104 nome, c107 armas marciais, c108 armadura pesada, c109 escudo) -----
  // Armas simples e armaduras leves são universais (todo personagem sabe usar) e
  // não ficam na planilha. Exótica e de Fogo vêm de poderes, nunca da classe base.
  const classProficiencies = []
  for (let r = 1; r < g.length; r++) {
    const name = at(r, 104)
    if (!name || name === '-' || name === 'CLASSES') continue
    classProficiencies.push({
      id: slug(name),
      name,
      armaMarcial: num(at(r, 107)) > 0,
      armaduraPesada: num(at(r, 108)) > 0,
      escudo: num(at(r, 109)) > 0,
      armaExotica: false,
      armaFogo: false,
    })
  }

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'origins.json'), JSON.stringify(origins, null, 2))
  writeFileSync(join(outDir, 'race-traits.json'), JSON.stringify(raceTraits, null, 2))
  writeFileSync(
    join(outDir, 'class-proficiencies.json'),
    JSON.stringify(classProficiencies, null, 2),
  )

  console.log(`origens: ${origins.length}, traços de raça: ${raceTraits.length}, proficiências: ${classProficiencies.length}`)
  console.log('\nTraços de raça (revisar):')
  for (const t of raceTraits) {
    console.log(
      `  ${t.name.padEnd(16)} desl=${t.deslocamento}m penumbra=${t.visaoPenumbra} escuro=${t.visaoEscuro} faro=${t.faro} ${t.tipo}/${t.tamanho}`,
    )
  }
}

main()
