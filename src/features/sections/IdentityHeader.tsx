import { useRef } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { CLASSES, ORIGINS, RACES, RACE_TRAITS_BY_ID } from '../../data'
import { Button } from '../../components/Button'
import { inputClass } from '../../components/ui'
import { fileToScaledDataUrl } from '../../lib/image'
import { deriveCharacter, equippedArmor, equippedShield, totalLevel } from '../../rules'
import type { Character } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

export function IdentityHeader({ character, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (field: keyof Character, value: unknown) =>
    update((c) => ({ ...c, [field]: value }))

  async function handleImage(file: File) {
    try {
      const dataUrl = await fileToScaledDataUrl(file)
      set('portrait', dataUrl)
    } catch {
      // ignora arquivo inválido
    }
  }

  function setClassEntry(i: number, classId: string, level: number) {
    update((c) => ({
      ...c,
      classes: c.classes.map((e, idx) => (idx === i ? { classId, level } : e)),
    }))
  }
  const addClass = () =>
    update((c) => ({ ...c, classes: [...c.classes, { classId: CLASSES[0].id, level: 1 }] }))
  const removeClass = (i: number) =>
    update((c) => ({ ...c, classes: c.classes.filter((_, idx) => idx !== i) }))

  // Valor de um recurso após resetar (zerar ou encher até o máximo).
  const resetValue = (r: Character['resources'][number]) =>
    r.resetTo === 'max' ? r.max ?? r.current : 0

  // Encerrar cena: desativa efeitos de duração "Cena" e reseta recursos marcados.
  const hasSceneActive =
    character.abilities.some((a) => a.duration === 'Cena' && a.effectActive) ||
    character.spells.some((s) => s.hasEffect && s.duration === 'Cena' && s.effectActive) ||
    character.effects.some((e) => e.duration === 'Cena' && e.active) ||
    character.resources.some((r) => r.resetsOnScene && r.current !== resetValue(r))
  const endScene = () =>
    update((c) => ({
      ...c,
      abilities: c.abilities.map((a) => (a.duration === 'Cena' ? { ...a, effectActive: false } : a)),
      spells: c.spells.map((s) => (s.duration === 'Cena' ? { ...s, effectActive: false } : s)),
      effects: c.effects.map((e) => (e.duration === 'Cena' ? { ...e, active: false } : e)),
      resources: c.resources.map((r) =>
        r.resetsOnScene ? { ...r, current: resetValue(r) } : r,
      ),
    }))

  // Fazer descanso (regra T20): recupera todos os PV e PM. Encerra a cena junto
  // (efeitos de Cena off + recursos resetados) e zera os pontos temporários.
  const rest = () =>
    update((c) => ({
      ...c,
      currentHitPoints: null,
      currentMana: null,
      temporaryHitPoints: 0,
      temporaryMana: 0,
      abilities: c.abilities.map((a) => (a.duration === 'Cena' ? { ...a, effectActive: false } : a)),
      spells: c.spells.map((s) => (s.duration === 'Cena' ? { ...s, effectActive: false } : s)),
      effects: c.effects.map((e) => (e.duration === 'Cena' ? { ...e, active: false } : e)),
      resources: c.resources.map((r) =>
        r.resetsOnScene ? { ...r, current: resetValue(r) } : r,
      ),
    }))

  const derived = deriveCharacter(character)
  const traits = character.race ? RACE_TRAITS_BY_ID[character.race.raceId] : undefined
  const senses = [
    traits?.visaoPenumbra && 'Visão na penumbra',
    traits?.visaoEscuro && 'Visão no escuro',
    traits?.faro && 'Faro',
  ].filter(Boolean) as string[]
  const prof = derived.proficiencies

  // Equipamentos equipados (o de maior Defesa, se houver mais de um por slot).
  const equipCtx = {
    attributes: derived.finalAttributes,
    level: derived.totalLevel,
    shieldDefense: derived.shieldDefense,
  }
  const armorSlot = equippedArmor(character, equipCtx)
  const shieldSlot = equippedShield(character, equipCtx)
  const multiArmor = armorSlot.count > 1
  const multiShield = shieldSlot.count > 1
  const multiWarning = multiArmor && multiShield
    ? 'Mais de uma armadura e mais de um escudo equipados'
    : multiArmor
      ? 'Mais de uma armadura equipada'
      : multiShield
        ? 'Mais de um escudo equipado'
        : ''

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {multiWarning && (
        <div className="mb-3 rounded-md border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">
          ⚠ {multiWarning} — usando o de maior Defesa.
        </div>
      )}
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1">
          {character.portrait ? (
            <img
              src={character.portrait}
              alt="Personagem"
              className="h-96 w-64 rounded-md border border-[var(--card-border)] object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-96 w-64 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[var(--card-border)] text-stone-400 hover:text-tormenta-300"
              aria-label="Adicionar imagem"
            >
              <ImagePlus size={20} />
              <span className="text-[10px]">Imagem</span>
            </button>
          )}
          {character.portrait && (
            <div className="flex gap-1">
              <Button variant="ghost" className="text-xs" onClick={() => fileRef.current?.click()} aria-label="Trocar imagem" title="Trocar imagem">
                <ImagePlus size={14} />
              </Button>
              <Button variant="ghost" className="text-xs" onClick={() => set('portrait', '')} aria-label="Remover imagem" title="Remover imagem">
                <Trash2 size={14} />
              </Button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImage(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={character.name}
              onChange={(e) => set('name', e.target.value)}
              className="min-w-0 flex-1 bg-transparent font-display text-3xl font-bold text-[var(--text)] focus:outline-none"
              aria-label="Nome do personagem"
              placeholder="Nome do personagem"
            />
            <div className="flex shrink-0 flex-col items-center rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1">
              <span className="text-[11px] uppercase text-stone-400">Nível</span>
              <span className="font-display text-2xl font-bold text-tormenta-300">
                {totalLevel(character)}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Labeled label="Raça">
              <select
                value={character.race?.raceId ?? ''}
                onChange={(e) =>
                  set('race', e.target.value ? { raceId: e.target.value } : null)
                }
                className={inputClass + ' w-full'}
              >
                <option value="">— Sem raça —</option>
                {RACES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Labeled>

            <Labeled label="Origem">
              <select
                value={character.originId ?? ''}
                onChange={(e) => set('originId', e.target.value || null)}
                className={inputClass + ' w-full'}
              >
                <option value="">— Sem origem —</option>
                {character.customOrigins.length > 0 && (
                  <optgroup label="Personalizadas">
                    {character.customOrigins.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name || 'Origem sem nome'}
                      </option>
                    ))}
                  </optgroup>
                )}
                {ORIGINS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </Labeled>

            <Labeled label="Jogador">
              <input
                type="text"
                value={character.player}
                onChange={(e) => set('player', e.target.value)}
                className={inputClass + ' w-full'}
              />
            </Labeled>

            <Labeled label="Divindade">
              <input
                type="text"
                value={character.deity}
                onChange={(e) => set('deity', e.target.value)}
                className={inputClass + ' w-full'}
              />
            </Labeled>
          </div>

          <div className="mt-3">
            <Labeled label={`Classes (nível ${totalLevel(character)})`}>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {character.classes.map((entry, i) => (
                  <div key={i} className="flex gap-1">
                    <select
                      value={entry.classId}
                      onChange={(e) => setClassEntry(i, e.target.value, entry.level)}
                      className={inputClass + ' flex-1'}
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      value={entry.level}
                      onChange={(e) =>
                        setClassEntry(i, entry.classId, Math.max(1, Number(e.target.value) || 1))
                      }
                      className={inputClass + ' w-14 text-center'}
                      aria-label="Nível"
                    />
                    <Button variant="ghost" onClick={() => removeClass(i)} aria-label="Remover classe">
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" onClick={addClass} className="text-xs">
                + classe
              </Button>
            </Labeled>
          </div>
          <dl className="mt-4 flex flex-row gap-4 w-full">
            <Info label="Tipo" value={traits?.tipo ?? '—'} />
            <Info label="Tamanho" value={traits?.tamanho ?? '—'} />
          </dl>
          <dl className="mt-4 flex flex-row gap-4 w-full">
            <Info label="Sentidos" value={senses.join(', ') || '—'} />
          </dl>
          <div className="mt-4 w-full space-y-0.5">
            <div className="text-stone-400">Proficiências</div>
            <ProfRow
              label="Armaduras"
              items={[
                ['Leves', prof.armaduras.leves],
                ['Pesadas', prof.armaduras.pesadas],
                ['Escudos', prof.armaduras.escudo],
              ]}
            />
            <ProfRow
              label="Armas"
              items={[
                ['Simples', prof.armas.simples],
                ['Marcial', prof.armas.marcial],
                ['Exótica', prof.armas.exotica],
                ['de Fogo', prof.armas.fogo],
              ]}
            />
          </div>

          {(armorSlot.item || shieldSlot.item) && (
            <dl className="mt-4 flex flex-row gap-4 w-full">
              {armorSlot.item && (
                <Info
                  label="Armadura"
                  value={`${armorSlot.item.name || 'Sem nome'} (+${armorSlot.defense} Def)`}
                />
              )}
              {shieldSlot.item && (
                <Info
                  label="Escudo"
                  value={`${shieldSlot.item.name || 'Sem nome'} (+${shieldSlot.defense} Def)`}
                />
              )}
            </dl>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              className="text-xs"
              onClick={() => {
                if (window.confirm('Fazer descanso? Recupera todos os PV e PM e encerra a cena.')) {
                  rest()
                }
              }}
              title="Recupera todos os PV e PM (regra de descanso)"
            >
              Fazer descanso
            </Button>
            <Button
              variant="secondary"
              className="text-xs"
              onClick={endScene}
              disabled={!hasSceneActive}
              title="Desativa os efeitos de duração Cena"
            >
              Encerrar cena
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 justify-between gap-2 border-b border-stone-800 py-0.5">
      <dt className="text-stone-400">{label}</dt>
      <dd className="text-right text-[var(--text)]">{value}</dd>
    </div>
  )
}

/** Linha de proficiências de uma categoria: ◉ quando proficiente, 〇 quando não. */
function ProfRow({ label, items }: { label: string; items: [string, boolean][] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b border-stone-800 py-0.5 text-sm">
      <span className="w-20 text-xs uppercase text-stone-400">{label}</span>
      {items.map(([name, on]) => (
        <span key={name} className={on ? 'text-[var(--text)]' : 'text-stone-600'}>
          {on ? '◉' : '〇'} {name}
        </span>
      ))}
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
        {label}
      </span>
      {children}
    </label>
  )
}
