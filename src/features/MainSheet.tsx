import { AbilitiesPanel } from './sections/AbilitiesPanel'
import { AttacksPanel } from './sections/AttacksPanel'
import { AttributesPanel } from './sections/AttributesPanel'
import { IdentityHeader } from './sections/IdentityHeader'
import { ResourcesPanel } from './sections/ResourcesPanel'
import { SkillsPanel } from './sections/SkillsPanel'
import { SpellsPanel } from './sections/SpellsPanel'
import { VitalsPanel } from './sections/VitalsPanel'
import type { Character } from '../schema'

interface Props {
  character: Character
  update: (updater: (c: Character) => Character) => void
}

/** Conteúdo da aba "Principal": a ficha de página única. */
export function MainSheet({ character, update }: Props) {
  const props = { character, update }
  return (
    <div className="space-y-4">
      <IdentityHeader {...props} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AttributesPanel {...props} />
          <VitalsPanel {...props} />
          <ResourcesPanel {...props} />
          <AttacksPanel {...props} />
        </div>
        <SkillsPanel {...props} />
      </div>

      <AbilitiesPanel {...props} />

      <SpellsPanel {...props} />
    </div>
  )
}
