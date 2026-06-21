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
 * Valor de um modificador: número fixo ou fórmula em texto (ex.: "@car + 2").
 * As fórmulas usam tokens (@for, @nivel…) resolvidos pelo motor de regras.
 */
export const modValueSchema = z.union([z.number().int(), z.string()])
export type ModValue = z.infer<typeof modValueSchema>

/**
 * Modificadores que um item pode conceder. Aplicados aos valores derivados
 * quando o item está com o efeito ativo. Chaves de `attributes` são ids de
 * atributo; de `skills`, ids de perícia. Todo valor pode ser número fixo ou
 * fórmula (ex.: "@car + 2").
 */
export const itemModifiersSchema = z.object({
  attributes: z.record(z.string(), modValueSchema).default({}),
  skills: z.record(z.string(), modValueSchema).default({}),
  /** Soma a TODOS os ataques (bônus de ataque geral). */
  attack: modValueSchema.default(0),
  /** Soma a TODAS as perícias (bônus de perícia geral). */
  allSkills: modValueSchema.default(0),
  /** Soma às perícias de resistência (Fortitude, Reflexos, Vontade). */
  resistance: modValueSchema.default(0),
  /** Soma ao PV máximo. */
  hitPoints: modValueSchema.default(0),
  /** Soma ao PM máximo. */
  mana: modValueSchema.default(0),
  defense: modValueSchema.default(0),
  /** Penalidade de armadura: aplicada às perícias com penalidade de armadura. */
  penalty: modValueSchema.default(0),
  /** Alteração de deslocamento (em metros), somada ao deslocamento base. */
  movement: modValueSchema.default(0),
  /** Redução de dano. */
  damageReduction: modValueSchema.default(0),
})
export type ItemModifiers = z.infer<typeof itemModifiersSchema>

export const EMPTY_ITEM_MODIFIERS: ItemModifiers = {
  attributes: {},
  skills: {},
  attack: 0,
  allSkills: 0,
  resistance: 0,
  hitPoints: 0,
  mana: 0,
  defense: 0,
  penalty: 0,
  movement: 0,
  damageReduction: 0,
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

/** Origem personalizada cadastrada pelo jogador. */
export const customOriginSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  pericasFixas: z.array(z.string()).default([]),
  pericasEscolha: z.number().int().default(0),
  power: z.string().nullable().default(null),
})
export type CustomOrigin = z.infer<typeof customOriginSchema>

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
  /** Custo em pontos de mana para conjurar (inclui aprimoramentos). */
  pm: z.number().int().min(0).default(1),
  /** Ação de execução (ex.: "Padrão", "Movimento", "Completa", "Reação", "Livre"). */
  action: z.string().default('Padrão'),
  /** Descrição do efeito da magia. */
  effect: z.string().default(''),
  prepared: z.boolean().default(false),
  notes: z.string().default(''),
})
export type Spell = z.infer<typeof spellSchema>

/** Um ataque/conjuração da tabela de ataques. */
export const attackSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Base de perícia/atributo somada ao bônus (ex.: 'luta-for', 'magico'). */
  base: z.string().default(''),
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
  /** Se a habilidade fornece um efeito (modificadores) ativável. */
  hasEffect: z.boolean().default(false),
  /** Se o efeito da habilidade está ativo. */
  effectActive: z.boolean().default(false),
  modifiers: itemModifiersSchema.default(EMPTY_ITEM_MODIFIERS),
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
  /** Imagem de fundo da ficha inteira (data URL). */
  backgroundImage: z.string().default(''),
  /** Ajuste da imagem de fundo: cobrir (corta) ou conter (cabe inteira). */
  backgroundFit: z.enum(['cover', 'contain']).default('cover'),
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
  backgroundImage: '',
  backgroundFit: 'cover',
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
  /** Imagem do personagem (data URL). */
  portrait: z.string().default(''),

  /** Escolhas que alimentam o motor de regras. */
  attributes: attributesSchema,
  /** Atributos escolhidos para o bônus livre da raça ("+1 em N atributos diferentes"). */
  attributeChoices: z.array(attributeKeySchema).default([]),
  race: raceSchema.nullable().default(null),
  /** Id da origem escolhida (catálogo de origens ou personalizada). */
  originId: z.string().nullable().default(null),
  /** Origens personalizadas cadastradas pelo jogador. */
  customOrigins: z.array(customOriginSchema).default([]),
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
  /** PV/PM temporários. */
  temporaryHitPoints: z.number().default(0),
  temporaryMana: z.number().default(0),

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
    portrait: '',
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
    customOrigins: [],
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
    temporaryHitPoints: 0,
    temporaryMana: 0,
    conditions: '',
    resistances: '',
    notes: '',
    theme: { ...DEFAULT_THEME },
  }
}
