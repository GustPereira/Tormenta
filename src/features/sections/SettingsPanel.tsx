import { Button } from '../../components/Button'
import { Panel } from '../../components/Panel'
import { inputClass } from '../../components/ui'
import { downloadCharacter } from '../../io'
import { FONT_OPTIONS } from '../../lib/theme'
import { DEFAULT_THEME, type Character, type Theme } from '../../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
  onDelete: () => void
}

export function SettingsPanel({ character, update, onDelete }: Props) {
  const restoreVitals = () =>
    update((c) => ({ ...c, currentHitPoints: null, currentMana: null }))

  const setTheme = (patch: Partial<Theme>) =>
    update((c) => ({ ...c, theme: { ...c.theme, ...patch } }))

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
      </Panel>
      <Panel title="Identidade">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Nome do personagem"
            value={character.name}
            onChange={(v) => update((c) => ({ ...c, name: v }))}
          />
          <Field
            label="Jogador"
            value={character.player}
            onChange={(v) => update((c) => ({ ...c, player: v }))}
          />
        </div>
      </Panel>

      <Panel title="Vida & Mana">
        <p className="mb-2 text-sm text-stone-400">
          Restaura os pontos de vida e mana atuais para o máximo calculado.
        </p>
        <Button variant="secondary" onClick={restoreVitals}>
          Restaurar PV/PM ao máximo
        </Button>
      </Panel>

      <Panel title="Backup">
        <p className="mb-2 text-sm text-stone-400">
          Exporte a ficha em JSON para guardar ou transferir para outro dispositivo.
        </p>
        <Button variant="secondary" onClick={() => downloadCharacter(character)}>
          Exportar JSON
        </Button>
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-stone-400">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass + ' w-full'}
      />
    </label>
  )
}
