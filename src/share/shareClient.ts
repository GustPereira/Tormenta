import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { parseCharacter, type Character } from '../schema'

/**
 * Compartilhamento de fichas via Supabase. Leitura é pública (qualquer um com o
 * id lê); a escrita passa por funções RPC que validam um `owner_token` secreto.
 * A chave anônima vai no bundle por design (protegida por RLS).
 */

const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export class ShareError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShareError'
  }
}

let client: SupabaseClient | null = null
function db(): SupabaseClient {
  if (!client) {
    if (!URL || !ANON_KEY) throw new ShareError('Compartilhamento não configurado.')
    client = createClient(URL, ANON_KEY)
  }
  return client
}

/** Verdadeiro se o compartilhamento está configurado (URL + anon key). */
export function isShareConfigured(): boolean {
  return Boolean(URL && ANON_KEY)
}

/** URL (rota do app) para abrir uma ficha compartilhada. */
export function shareUrl(shareId: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}ficha/compartilhada/${shareId}`
}

export interface PublishResult {
  id: string
  token: string
}

/** Publica a ficha: o servidor gera id + token e devolve ambos. */
export async function publishCharacter(character: Character): Promise<PublishResult> {
  const { data, error } = await db().rpc('publish_character', { p_data: character })
  if (error) throw new ShareError(error.message)
  const row = (Array.isArray(data) ? data[0] : data) as { id: string; owner_token: string }
  return { id: row.id, token: row.owner_token }
}

/** Atualiza a ficha publicada (link vivo). Requer o token de dono. */
export async function updateSharedCharacter(
  shareId: string,
  token: string,
  character: Character,
): Promise<void> {
  const { error } = await db().rpc('update_character', {
    p_id: shareId,
    p_token: token,
    p_data: character,
  })
  if (error) throw new ShareError(error.message)
}

/** Despublica a ficha. Requer o token de dono. */
export async function deleteSharedCharacter(shareId: string, token: string): Promise<void> {
  const { error } = await db().rpc('unpublish_character', { p_id: shareId, p_token: token })
  if (error) throw new ShareError(error.message)
}

/** Busca uma ficha compartilhada pelo id. */
export async function getSharedCharacter(shareId: string): Promise<Character> {
  const { data, error } = await db()
    .from('shared_characters')
    .select('data')
    .eq('id', shareId)
    .maybeSingle()
  if (error) throw new ShareError(error.message)
  if (!data) throw new ShareError('Ficha compartilhada não encontrada.')
  return parseCharacter((data as { data: unknown }).data)
}

/**
 * Assina atualizações em tempo real de uma ficha compartilhada. A cada mudança,
 * rebusca a linha completa (evita limite de tamanho do payload do realtime) e
 * chama `onChange`. Retorna uma função para cancelar a assinatura.
 */
export function subscribeSharedCharacter(
  shareId: string,
  onChange: (character: Character) => void,
): () => void {
  const supabase = db()
  const channel = supabase
    .channel(`shared:${shareId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'shared_characters', filter: `id=eq.${shareId}` },
      () => {
        void getSharedCharacter(shareId)
          .then(onChange)
          .catch(() => {
            /* mantém o último estado bom (ex.: ficha despublicada) */
          })
      },
    )
    .subscribe()
  return () => {
    void supabase.removeChannel(channel)
  }
}
