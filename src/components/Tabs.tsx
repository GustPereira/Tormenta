interface TabsProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-stone-700" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-b-2 border-tormenta-500 text-tormenta-300'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
