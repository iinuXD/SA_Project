const KKU_CENTER = { lat: 16.4748, lng: 102.8196 }

/**
 * Extract lat/lng from a Google Maps URL.
 * Supports formats like:
 *   https://www.google.com/maps/place/.../@16.4748,102.8196,...
 *   https://www.google.com/maps?q=16.4748,102.8196
 *   https://www.google.com/maps/search/?api=1&query=16.4748,102.8196
 *   https://maps.google.com/?ll=16.4748,102.8196
 * Returns { lat, lng } or fallback (KKU_CENTER).
 */
export function parseCoordsFromUrl(url, fallback = KKU_CENTER) {
  if (!url) return fallback

  // Pattern 1: !3d<lat>!4d<lng> — exact place pin (most accurate)
  const pinMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (pinMatch) return { lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]) }

  // Pattern 2: /@lat,lng — map viewport center
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }

  // Pattern 3: ?q=lat,lng or &query=lat,lng
  const qMatch = url.match(/[?&](?:q|query)=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }

  // Pattern 4: &ll=lat,lng
  const llMatch = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) }

  return fallback
}

export { KKU_CENTER }
