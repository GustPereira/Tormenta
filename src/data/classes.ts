import type { ClassDef } from './types'

/**
 * Catálogo de classes do Tormenta T20 (Livro Básico, Capítulo 1).
 * PV/PM extraídos das descrições oficiais de cada classe.
 *
 * Observação: `pericasFixas` lista as perícias treinadas garantidas pela classe.
 * Em classes com escolha do tipo "X ou Y" (ex.: Guerreiro — Luta ou Pontaria),
 * ambas as opções aparecem na lista; o travamento exato dessa escolha é
 * tratado na UI e ainda é aproximado nesta primeira versão.
 */
export const CLASSES: ClassDef[] = [
  { id: 'arcanista', name: 'Arcanista', pvInicial: 8, pvPorNivel: 2, pmPorNivel: 6, pericasEscolha: 2, pericasFixas: ['misticismo', 'vontade'] },
  { id: 'barbaro', name: 'Bárbaro', pvInicial: 24, pvPorNivel: 6, pmPorNivel: 3, pericasEscolha: 4, pericasFixas: ['fortitude', 'luta'] },
  { id: 'bardo', name: 'Bardo', pvInicial: 12, pvPorNivel: 3, pmPorNivel: 4, pericasEscolha: 6, pericasFixas: ['atuacao', 'reflexos'] },
  { id: 'bucaneiro', name: 'Bucaneiro', pvInicial: 16, pvPorNivel: 4, pmPorNivel: 3, pericasEscolha: 4, pericasFixas: ['luta', 'pontaria', 'reflexos'] },
  { id: 'cacador', name: 'Caçador', pvInicial: 16, pvPorNivel: 4, pmPorNivel: 4, pericasEscolha: 6, pericasFixas: ['luta', 'pontaria', 'sobrevivencia'] },
  { id: 'cavaleiro', name: 'Cavaleiro', pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3, pericasEscolha: 2, pericasFixas: ['fortitude', 'luta'] },
  { id: 'clerigo', name: 'Clérigo', pvInicial: 16, pvPorNivel: 4, pmPorNivel: 5, pericasEscolha: 2, pericasFixas: ['religiao', 'vontade'] },
  { id: 'druida', name: 'Druida', pvInicial: 16, pvPorNivel: 4, pmPorNivel: 4, pericasEscolha: 4, pericasFixas: ['sobrevivencia', 'vontade'] },
  { id: 'guerreiro', name: 'Guerreiro', pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3, pericasEscolha: 2, pericasFixas: ['luta', 'pontaria', 'fortitude'] },
  { id: 'inventor', name: 'Inventor', pvInicial: 12, pvPorNivel: 3, pmPorNivel: 4, pericasEscolha: 4, pericasFixas: ['oficio', 'vontade'] },
  { id: 'ladino', name: 'Ladino', pvInicial: 12, pvPorNivel: 3, pmPorNivel: 4, pericasEscolha: 8, pericasFixas: ['ladinagem', 'reflexos'] },
  { id: 'lutador', name: 'Lutador', pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3, pericasEscolha: 4, pericasFixas: ['fortitude', 'luta'] },
  { id: 'nobre', name: 'Nobre', pvInicial: 16, pvPorNivel: 4, pmPorNivel: 4, pericasEscolha: 4, pericasFixas: ['diplomacia', 'intimidacao', 'vontade'] },
  { id: 'paladino', name: 'Paladino', pvInicial: 20, pvPorNivel: 5, pmPorNivel: 3, pericasEscolha: 2, pericasFixas: ['luta', 'vontade'] },
]

/** Índice de classe por id. */
export const CLASSES_BY_ID: Record<string, ClassDef> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
)
