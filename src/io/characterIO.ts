import { CharacterParseError, parseCharacter, type Character } from '../schema'

/** Serializa uma ficha para JSON formatado (pronto para download/backup). */
export function exportCharacterToJson(character: Character): string {
  return JSON.stringify(character, null, 2)
}

/**
 * Interpreta o texto de um arquivo JSON como uma ficha válida.
 * Lança `CharacterParseError` se o texto não for JSON ou não for uma ficha válida.
 */
export function importCharacterFromJson(text: string): Character {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (err) {
    throw new CharacterParseError('O arquivo não é um JSON válido.', err)
  }
  return parseCharacter(data)
}

/** Nome de arquivo seguro a partir do nome da ficha. */
export function characterFileName(character: Character): string {
  const slug =
    character.name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'ficha'
  return `${slug}.t20.json`
}

/** Dispara o download da ficha como arquivo JSON no navegador. */
export function downloadCharacter(character: Character): void {
  const blob = new Blob([exportCharacterToJson(character)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = characterFileName(character)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Lê um `File` (input de upload) e retorna a ficha validada. */
export async function importCharacterFromFile(file: File): Promise<Character> {
  const text = await file.text()
  return importCharacterFromJson(text)
}
