// Display helpers for the site: pt-BR labels and TMDB image URLs.
import type { Offer, OfferType } from './contract'

// Labels, best Offer Type first.
export const OFFER_TYPES: Record<OfferType, string> = { subscription: 'Assinatura', free: 'Grátis', ads: 'Com anúncios', rent: 'Aluguel', buy: 'Compra' }

export const img = (size: string, path: string) => `https://image.tmdb.org/t/p/${size}${path}`

export const runtimeLabel = (min: number) => `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}`

const regionNames = new Intl.DisplayNames('pt-BR', { type: 'region' })
const languageNames = new Intl.DisplayNames('pt-BR', { type: 'language' })
// TMDB keeps codes of countries that no longer exist; Intl doesn't know them or names their successor.
const GONE: Record<string, string> = { XC: 'Tchecoslováquia', SU: 'União Soviética', AN: 'Antilhas Holandesas' }
export const countryName = (code: string) => GONE[code] ?? regionNames.of(code) ?? code
// TMDB uses 'cn' for Cantonese.
export const languageName = (code: string) => {
  const name = languageNames.of(code === 'cn' ? 'yue' : code) ?? code
  return name[0].toUpperCase() + name.slice(1)
}

// One entry per Provider with every Offer Type it has, best first; Providers ordered by their best Offer Type.
export const providersOf = (offers: Offer[]) => {
  const rank = Object.keys(OFFER_TYPES)
  const byProvider = new Map<number, Offer & { types: OfferType[] }>()
  for (const o of offers.toSorted((a, b) => rank.indexOf(a.type) - rank.indexOf(b.type))) {
    const p = byProvider.get(o.providerId)
    if (!p) byProvider.set(o.providerId, { ...o, types: [o.type] })
    else if (!p.types.includes(o.type)) p.types.push(o.type)
  }
  return [...byProvider.values()]
}
