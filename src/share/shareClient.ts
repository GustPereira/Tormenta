import { exportCharacterToJson } from '../io'
import { parseCharacter, type Character } from '../schema'

/**
 * Cliente de compartilhamento via GitHub Contents API. Cada ficha publicada é
 * um arquivo `fichas/<shareId>.json` num repositório de dados público
 * (`VITE_SHARE_REPO`), escrito com um token (`VITE_SHARE_TOKEN`).
 *
 * Como o app é estático, o token fica embutido no bundle — por isso usamos um
 * repositório SEPARADO e um token com escopo só nele (Contents r/w).
 */

const REPO = import.meta.env.VITE_SHARE_REPO as string | undefined
const TOKEN = import.meta.env.VITE_SHARE_TOKEN as string | undefined
const API = 'https://api.github.com'

export class ShareError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShareError'
  }
}

/** Verdadeiro se o compartilhamento está configurado (repo + token). */
export function isShareConfigured(): boolean {
  return Boolean(REPO && TOKEN)
}

/** Gera um novo id de compartilhamento. */
export function newShareId(): string {
  return crypto.randomUUID()
}

/** URL (rota do app) para abrir uma ficha compartilhada. */
export function shareUrl(shareId: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}ficha/compartilhada/${shareId}`
}

function filePath(shareId: string): string {
  return `fichas/${shareId}.json`
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

/** Codifica texto UTF-8 em base64 (formato exigido pela Contents API). */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/** Decodifica base64 (com quebras de linha da API) em texto UTF-8. */
function fromBase64(b64: string): string {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** SHA atual do arquivo (necessário para atualizar/remover), ou undefined se não existe. */
async function currentSha(shareId: string): Promise<string | undefined> {
  const res = await fetch(`${API}/repos/${REPO}/contents/${filePath(shareId)}`, {
    headers: authHeaders(),
  })
  if (res.status === 404) return undefined
  if (!res.ok) throw new ShareError(`Falha ao consultar o compartilhamento (${res.status}).`)
  const json = (await res.json()) as { sha: string }
  return json.sha
}

/** Publica (ou atualiza) a ficha no repositório de dados. */
export async function putSharedCharacter(shareId: string, character: Character): Promise<void> {
  if (!isShareConfigured()) throw new ShareError('Compartilhamento não configurado.')
  const sha = await currentSha(shareId)
  const res = await fetch(`${API}/repos/${REPO}/contents/${filePath(shareId)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      message: `${sha ? 'Atualiza' : 'Publica'} ficha ${shareId}`,
      content: toBase64(exportCharacterToJson(character)),
      ...(sha ? { sha } : {}),
    }),
  })
  if (!res.ok) throw new ShareError(`Falha ao publicar a ficha (${res.status}).`)
}

/** Busca uma ficha compartilhada pelo id (lança ShareError se não existir). */
export async function getSharedCharacter(shareId: string): Promise<Character> {
  if (!REPO) throw new ShareError('Compartilhamento não configurado.')
  const res = await fetch(`${API}/repos/${REPO}/contents/${filePath(shareId)}`, {
    headers: authHeaders(),
  })
  if (res.status === 404) throw new ShareError('Ficha compartilhada não encontrada.')
  if (!res.ok) throw new ShareError(`Falha ao buscar a ficha (${res.status}).`)
  const json = (await res.json()) as { content: string }
  return parseCharacter(JSON.parse(fromBase64(json.content)))
}

/** Remove a ficha compartilhada (despublica). */
export async function deleteSharedCharacter(shareId: string): Promise<void> {
  if (!isShareConfigured()) throw new ShareError('Compartilhamento não configurado.')
  const sha = await currentSha(shareId)
  if (!sha) return
  const res = await fetch(`${API}/repos/${REPO}/contents/${filePath(shareId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ message: `Despublica ficha ${shareId}`, sha }),
  })
  if (!res.ok) throw new ShareError(`Falha ao despublicar a ficha (${res.status}).`)
}
