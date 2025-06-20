export function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  
  // Format as dollars per 1K tokens
  const pricePerThousand = price * 1000
  
  if (pricePerThousand < 0.01) {
    // Show more decimal places for very small amounts
    return `$${pricePerThousand.toFixed(4)}/1K`
  }
  
  return `$${pricePerThousand.toFixed(2)}/1K`
}

export function formatContextLength(contextLength?: number): string {
  if (!contextLength) return 'Unknown'
  
  if (contextLength >= 1000000) {
    return `${(contextLength / 1000000).toFixed(1)}M`
  }
  
  if (contextLength >= 1000) {
    return `${(contextLength / 1000).toFixed(0)}K`
  }
  
  return contextLength.toString()
}

export function getCostTierColor(tier: string): string {
  switch (tier) {
    case 'free':
      return '#10b981' // green
    case 'low':
      return '#3b82f6' // blue
    case 'medium':
      return '#f59e0b' // amber
    case 'high':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}

export function getCostTierLabel(tier: string): string {
  switch (tier) {
    case 'free':
      return 'Free'
    case 'low':
      return 'Low Cost'
    case 'medium':
      return 'Medium Cost'
    case 'high':
      return 'High Cost'
    default:
      return 'Unknown'
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 