/**
 * Lê um arquivo de imagem e devolve um data URL, reduzindo a dimensão máxima
 * para `maxSize` px (re-encodando em JPEG) para não inchar o armazenamento/JSON.
 */
export async function fileToScaledDataUrl(file: File, maxSize = 512): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler o arquivo.'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Imagem inválida.'))
    image.src = dataUrl
  })

  const largest = Math.max(img.width, img.height)
  const scale = Math.min(1, maxSize / largest)
  // Imagem já pequena e arquivo leve: mantém como está.
  if (scale >= 1 && file.size < 200_000) return dataUrl

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}
