/**
 * Move o item de id `activeId` para a posição do item de id `overId`, mantendo a
 * ordem dos demais. Como cada lista da ficha (habilidades, magias, itens) é um
 * array plano filtrado por grupo, mover dentro do array plano preserva os grupos
 * (o filtro é estável). Retorna o mesmo array (referência) quando nada muda.
 */
export function arrayMove<T extends { id: string }>(items: T[], activeId: string, overId: string): T[] {
  if (activeId === overId) return items
  const from = items.findIndex((i) => i.id === activeId)
  const to = items.findIndex((i) => i.id === overId)
  if (from < 0 || to < 0) return items
  const copy = items.slice()
  const [moved] = copy.splice(from, 1)
  copy.splice(to, 0, moved)
  return copy
}
