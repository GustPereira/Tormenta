import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { EditableCard } from '../../components/EditableCard'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { SKILLS } from '../../data'
import { downloadCharacter } from '../../io'
import { fileToScaledDataUrl } from '../../lib/image'
import { FONT_OPTIONS } from '../../lib/theme'
import {
  DEFAULT_THEME,
  type Character,
  type CustomOrigin,
  type Theme,
} from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
  onDelete: () => void
}

export function SettingsPanel({ character, update, onDelete }: Props) {
  const bgFileRef = useRef<HTMLInputElement>(null)
  const setTheme = (patch: Partial<Theme>) =>
    update((c) => ({ ...c, theme: { ...c.theme, ...patch } }))

  async function handleBackground(file: File) {
    try {
      const dataUrl = await fileToScaledDataUrl(file, 1280)
      setTheme({ backgroundImage: dataUrl })
    } catch {
      // ignora arquivo inválido
    }
  }

  const [lastOriginId, setLastOriginId] = useState<string | null>(null)
  const setOrigin = (id: string, patch: Partial<CustomOrigin>) =>
    update((c) => ({
      ...c,
      customOrigins: c.customOrigins.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))
  const addOrigin = () => {
    const id = crypto.randomUUID()
    setLastOriginId(id)
    update((c) => ({
      ...c,
      customOrigins: [
        ...c.customOrigins,
        { id, name: '', pericasFixas: [], pericasEscolha: 0, power: null },
      ],
    }))
  }
  const removeOrigin = (id: string) =>
    update((c) => ({
      ...c,
      customOrigins: c.customOrigins.filter((o) => o.id !== id),
      originId: c.originId === id ? null : c.originId,
    }))
  const toggleOriginSkill = (o: CustomOrigin, skillId: string) =>
    setOrigin(o.id, {
      pericasFixas: o.pericasFixas.includes(skillId)
        ? o.pericasFixas.filter((s) => s !== skillId)
        : [...o.pericasFixas, skillId],
    })

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Panel
        title="Tema da ficha"
        action={
          <Button
            variant="ghost"
            className="text-xs"
            onClick={() => setTheme({ ...DEFAULT_THEME })}
          >
            Restaurar padrão
          </Button>
        }
      >
        <p className="mb-3 text-sm text-stone-400">
          Escolha uma cor para cada área da ficha. As mudanças aparecem na aba
          Principal.
        </p>

        <div className="space-y-1">
          <ColorField
            label="Fundo da página"
            value={character.theme.pageBg}
            onChange={(v) => setTheme({ pageBg: v })}
          />
          <ColorField
            label="Fundo dos cards"
            value={character.theme.cardBg}
            onChange={(v) => setTheme({ cardBg: v })}
          />
          <ColorField
            label="Borda das seções"
            value={character.theme.cardBorder}
            onChange={(v) => setTheme({ cardBorder: v })}
          />
          <ColorField
            label="Destaque (títulos, números, realces)"
            value={character.theme.accent}
            onChange={(v) => setTheme({ accent: v })}
          />
          <ColorField
            label="Cor do texto"
            value={character.theme.textColor}
            onChange={(v) => setTheme({ textColor: v })}
          />
          <ColorField
            label="Rótulos e textos secundários"
            value={character.theme.mutedColor}
            onChange={(v) => setTheme({ mutedColor: v })}
          />
          <ColorField
            label="Fundo do botão padrão"
            value={character.theme.buttonColor}
            onChange={(v) => setTheme({ buttonColor: v })}
          />
          <ColorField
            label="Texto dos botões"
            value={character.theme.buttonTextColor}
            onChange={(v) => setTheme({ buttonTextColor: v })}
          />
          <ColorField
            label="Fundo dos campos"
            value={character.theme.inputBg}
            onChange={(v) => setTheme({ inputBg: v })}
          />
          <ColorField
            label="Texto dos campos"
            value={character.theme.inputText}
            onChange={(v) => setTheme({ inputText: v })}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-400">
            Fonte
          </label>
          <select
            value={character.theme.fontId}
            onChange={(e) => setTheme({ fontId: e.target.value })}
            className={inputClass + ' w-full sm:w-64'}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-stone-400">
            Imagem de fundo
          </label>
          <div className="flex items-center gap-2">
            {character.theme.backgroundImage && (
              <img
                src={character.theme.backgroundImage}
                alt="Fundo"
                className="h-12 w-20 rounded border border-[var(--card-border)] object-cover"
              />
            )}
            <Button variant="secondary" onClick={() => bgFileRef.current?.click()}>
              {character.theme.backgroundImage ? 'Trocar imagem' : 'Enviar imagem'}
            </Button>
            {character.theme.backgroundImage && (
              <Button variant="ghost" className="text-xs" onClick={() => setTheme({ backgroundImage: '' })}>
                Remover
              </Button>
            )}
            {character.theme.backgroundImage && (
              <select
                value={character.theme.backgroundFit}
                onChange={(e) => setTheme({ backgroundFit: e.target.value as 'cover' | 'contain' })}
                className={inputClass + ' text-sm'}
                aria-label="Ajuste da imagem de fundo"
              >
                <option value="cover">Cobrir (corta)</option>
                <option value="contain">Conter (cabe inteira)</option>
              </select>
            )}
            <input
              ref={bgFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleBackground(file)
                e.target.value = ''
              }}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Backup">
        <p className="mb-2 text-sm text-stone-400">
          Exporte a ficha em JSON para guardar ou transferir para outro dispositivo.
        </p>
        <Button variant="secondary" onClick={() => downloadCharacter(character)}>
          Exportar JSON
        </Button>
      </Panel>

      <Panel
        title="Origens personalizadas"
        action={<Button variant="ghost" className="text-xs" onClick={addOrigin}>+ origem</Button>}
      >
        {character.customOrigins.length === 0 ? (
          <p className="text-sm text-stone-500">
            Crie uma origem própria (nome, perícias treinadas e poder). Ela aparece no seletor de Origem.
          </p>
        ) : (
          <ul className="space-y-2">
            {character.customOrigins.map((o) => (
              <EditableCard
                key={o.id}
                title={o.name || 'Origem sem nome'}
                summary={o.pericasFixas.map((s) => SKILLS.find((k) => k.id === s)?.name ?? s).join(', ') || 'sem perícias'}
                onDelete={() => removeOrigin(o.id)}
                deleteName={o.name}
                startEditing={o.id === lastOriginId}
              >
                <div className="space-y-2">
                  <input
                    type="text"
                    value={o.name}
                    placeholder="Nome da origem"
                    onChange={(e) => setOrigin(o.id, { name: e.target.value })}
                    className={inputClass + ' w-full font-medium'}
                    aria-label="Nome da origem"
                  />
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Poder concedido
                    <input
                      type="text"
                      value={o.power ?? ''}
                      onChange={(e) => setOrigin(o.id, { power: e.target.value || null })}
                      className={inputClass + ' flex-1'}
                      aria-label="Poder da origem"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-stone-400">
                    Perícias à escolha
                    <input
                      type="number"
                      min={0}
                      value={o.pericasEscolha}
                      onChange={(e) => setOrigin(o.id, { pericasEscolha: Math.max(0, Number(e.target.value) || 0) })}
                      className={inputClass + ' w-16 text-center'}
                      aria-label="Perícias à escolha"
                    />
                  </label>
                  <div>
                    <span className="mb-1 block text-xs text-stone-400">Perícias treinadas</span>
                    <div className="flex flex-wrap gap-1">
                      {SKILLS.map((s) => {
                        const selected = o.pericasFixas.includes(s.id)
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleOriginSkill(o, s.id)}
                            className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                              selected ? 'bg-tormenta-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                            }`}
                          >
                            {s.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </EditableCard>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Zona de perigo" className="border-red-900/60">
        <p className="mb-2 text-sm text-stone-400">
          Excluir esta ficha é permanente e não pode ser desfeito.
        </p>
        <Button variant="danger" onClick={onDelete}>
          Excluir ficha
        </Button>
      </Panel>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-stone-800 py-1.5">
      <span className="text-sm text-stone-300">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded border border-stone-600 bg-stone-800"
          aria-label={label}
        />
      </div>
    </div>
  )
}
