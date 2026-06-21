import { z } from 'zod'

/**
 * Versão atual do schema da ficha. Incrementar sempre que o formato persistido
 * mudar de forma incompatível, e adicionar a migração correspondente em migrate.ts.
 */
export const CURRENT_SCHEMA_VERSION = 2 as const

/** Os seis atributos do Tormenta T20. No T20 o valor do atributo JÁ É o modificador. */
export const ATTRIBUTE_KEYS = [
  'forca',
  'destreza',
  'constituicao',
  'inteligencia',
  'sabedoria',
  'carisma',
] as const

export const ACTION_KEYS = [
  'Ação Padrão',
  'Reação',
  'Movimento',
  'Completa',
] as const

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number]
export type ActionKey = (typeof ACTION_KEYS)[number]

export const attributeKeySchema = z.enum(ATTRIBUTE_KEYS)
export const actionKeySchema = z.enum(ACTION_KEYS)

export const attributesSchema = z.object({
  forca: z.number().int(),
  destreza: z.number().int(),
  constituicao: z.number().int(),
  inteligencia: z.number().int(),
  sabedoria: z.number().int(),
  carisma: z.number().int(),
})
export type Attributes = z.infer<typeof attributesSchema>

/** Uma entrada de classe — suporta multiclasse (várias entradas). */
export const classEntrySchema = z.object({
  classId: z.string(),
  level: z.number().int().min(1),
})
export type ClassEntry = z.infer<typeof classEntrySchema>

export const raceSchema = z.object({
  raceId: z.string(),
})
export type Race = z.infer<typeof raceSchema>

/**
 * Modificadores que um item pode conceder. Aplicados aos valores derivados
 * quando o item está com o efeito ativo. Chaves de `attributes` são ids de
 * atributo; de `skills`, ids de perícia.
 */
export const itemModifiersSchema = z.object({
  attributes: z.record(z.string(), z.number().int()).default({}),
  skills: z.record(z.string(), z.number().int()).default({}),
  /** Soma ao PV máximo. */
  hitPoints: z.number().int().default(0),
  /** Soma ao PM máximo. */
  mana: z.number().int().default(0),
  defense: z.number().int().default(0),
  /** Penalidade de armadura: aplicada às perícias com penalidade de armadura. */
  penalty: z.number().int().default(0),
  /** Alteração de deslocamento (em metros), somada ao deslocamento base. */
  movement: z.number().int().default(0),
})
export type ItemModifiers = z.infer<typeof itemModifiersSchema>

export const EMPTY_ITEM_MODIFIERS: ItemModifiers = {
  attributes: {},
  skills: {},
  hitPoints: 0,
  mana: 0,
  defense: 0,
  penalty: 0,
  movement: 0,
}

/**
 * Efeito nomeado e ativável que altera valores derivados (atributos, perícias,
 * vitais, defesa). É a forma persistida; a classe `Effect` (rules/effect.ts)
 * adiciona o comportamento sobre estes dados.
 */
export const effectSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  active: z.boolean().default(true),
  modifiers: itemModifiersSchema.default(EMPTY_ITEM_MODIFIERS),
})
export type EffectData = z.infer<typeof effectSchema>

export const inventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().min(0).default(1),
  /** Peso em espaços (sistema de carga do T20). */
  spaces: z.number().min(0).default(0),
  equipped: z.boolean().default(false),
  /** Proficiência exigida (ex.: Leves, Pesadas, Escudos). Informativo. */
  proficiency: z.string().default(''),
  /** Se verdadeiro, os modificadores do item são aplicados aos valores derivados. */
  activeEffect: z.boolean().default(false),
  modifiers: itemModifiersSchema.default(EMPTY_ITEM_MODIFIERS),
  notes: z.string().default(''),
})
export type InventoryItem = z.infer<typeof inventoryItemSchema>

/** Uma magia conhecida, agrupada por círculo (1 a 5). */
export const spellSchema = z.object({
  id: z.string(),
  name: z.string(),
  circle: z.number().int().min(1).max(5).default(1),
  prepared: z.boolean().default(false),
  notes: z.string().default(''),
})
export type Spell = z.infer<typeof spellSchema>

/** Um ataque/conjuração da tabela de ataques. */
export const attackSchema = z.object({
  id: z.string(),
  name: z.string(),
  attackBonus: z.string().default(''),
  damage: z.string().default(''),
  critical: z.string().default(''),
  damageType: z.string().default(''),
  range: z.string().default(''),
})
export type Attack = z.infer<typeof attackSchema>

/** Uma habilidade/poder, agrupada por fonte (racial&origem ou classe&geral). */
export const abilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Nível em que a habilidade é obtida. */
  level: z.number().int().default(1),
  mp: z.number().default(0),
  acao: z.array(actionKeySchema).default(['Ação Padrão']),
  group: z.enum(['racial', 'classe']).default('classe'),
  notes: z.string().default(''),
})
export type Ability = z.infer<typeof abilitySchema>

/** Tema visual da ficha: cores por área e fonte. */
export const themeSchema = z.object({
  /** Fundo da página inteira. */
  pageBg: z.string().default('#1a1414'),
  /** Fundo dos cards/seções. */
  cardBg: z.string().default('#1c1917'),
  /** Borda das seções. */
  cardBorder: z.string().default('#44403c'),
  /** Cor de destaque (títulos, números, realces). */
  accent: z.string().default('#c23434'),
  /** Cor do texto principal. */
  textColor: z.string().default('#f5efe6'),
  /** Cor dos rótulos e textos secundários (labels, legendas, dicas). */
  mutedColor: z.string().default('#a8a29e'),
  /** Cor de fundo do botão padrão. */
  buttonColor: z.string().default('#44403c'),
  /** Cor do texto dos botões. */
  buttonTextColor: z.string().default('#f5f5f4'),
  /** Cor de fundo dos campos (input, select). */
  inputBg: z.string().default('#292524'),
  /** Cor do texto dentro dos campos. */
  inputText: z.string().default('#f5f5f4'),
  fontId: z.string().default('cinzel'),
})
export type Theme = z.infer<typeof themeSchema>

export const DEFAULT_THEME: Theme = {
  pageBg: '#1a1414',
  cardBg: '#1c1917',
  cardBorder: '#44403c',
  accent: '#c23434',
  textColor: '#f5efe6',
  mutedColor: '#a8a29e',
  buttonColor: '#44403c',
  buttonTextColor: '#f5f5f4',
  inputBg: '#292524',
  inputText: '#f5f5f4',
  fontId: 'cinzel',
}

export const characterSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  id: z.string(),
  name: z.string(),
  meta: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
  }),

  /** Identidade narrativa. */
  player: z.string().default(''),
  origin: z.string().default(''),
  deity: z.string().default(''),
  alignment: z.string().default(''),

  /** Escolhas que alimentam o motor de regras. */
  attributes: attributesSchema,
  /** Atributos escolhidos para o bônus livre da raça ("+1 em N atributos diferentes"). */
  attributeChoices: z.array(attributeKeySchema).default([]),
  race: raceSchema.nullable().default(null),
  /** Id da origem escolhida (catálogo de origens). */
  originId: z.string().nullable().default(null),
  classes: z.array(classEntrySchema).default([]),
  /** IDs das perícias treinadas pelo jogador. */
  trainedSkills: z.array(z.string()).default([]),
  abilities: z.array(abilitySchema).default([]),
  spells: z.array(spellSchema).default([]),
  attacks: z.array(attackSchema).default([]),
  inventory: z.array(inventoryItemSchema).default([]),
  /** Efeitos avulsos (não vindos de itens), editáveis pelo jogador. */
  effects: z.array(effectSchema).default([]),
  /** Dinheiro em Tibares (T$). */
  money: z.number().min(0).default(0),

  /** PV/PM atuais (null = cheio). */
  currentHitPoints: z.number().nullable().default(null),
  currentMana: z.number().nullable().default(null),

  conditions: z.string().default(''),
  resistances: z.string().default(''),
  notes: z.string().default(''),

  theme: themeSchema.default(DEFAULT_THEME),
})

export type Character = z.infer<typeof characterSchema>

/** Cria uma ficha nova em branco, pronta para edição. */
export function createBlankCharacter(name = 'Nova Ficha'): Character {
  const now = new Date().toISOString()
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name,
    meta: { createdAt: now, updatedAt: now },
    player: '',
    origin: '',
    deity: '',
    alignment: '',
    attributes: {
      forca: 0,
      destreza: 0,
      constituicao: 0,
      inteligencia: 0,
      sabedoria: 0,
      carisma: 0,
    },
    attributeChoices: [],
    race: null,
    originId: null,
    classes: [],
    trainedSkills: [],
    abilities: [],
    spells: [],
    attacks: [],
    inventory: [],
    effects: [],
    money: 0,
    currentHitPoints: null,
    currentMana: null,
    conditions: '',
    resistances: '',
    notes: '',
    theme: { ...DEFAULT_THEME },
  }
}
