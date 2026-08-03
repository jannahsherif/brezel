/**
 * Ported verbatim from the product — Prototype/src/lib/util.ts and src/data/seed.ts.
 *
 * This file must stay in sync with the product. The landing page's whole claim in Act III is
 * that what you drag is what Brezel actually computes, so if `computeCascade` changes there,
 * it changes here.
 */

export interface Cue {
  id: string
  room: string
  /** HH:MM 24h */
  start: string
  durationMin: number
  title: string
  /** null is a first-class state and renders as a risk, not a blank. */
  owner: string | null
  dependsOn: string[]
  vendorIds: string[]
}

export const toMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const toHHMM = (mins: number): string => {
  const wrapped = ((mins % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const shiftTime = (hhmm: string, deltaMin: number): string => toHHMM(toMin(hhmm) + deltaMin)

export interface CascadeResult {
  moved: { cue: Cue; from: string; to: string }[]
  conflicts: { room: string; a: Cue; b: Cue }[]
  vendorIds: string[]
}

/**
 * Move a cue and cascade the shift through everything that transitively depends on it.
 * This is what makes a schedule change legible as "4 downstream impacts" rather than one edit.
 */
export const computeCascade = (cues: Cue[], cueId: string, deltaMin: number): CascadeResult => {
  const byId = new Map(cues.map((c) => [c.id, c]))
  const affected = new Set<string>([cueId])

  // Transitive closure over dependsOn edges.
  let grew = true
  while (grew) {
    grew = false
    for (const c of cues) {
      if (affected.has(c.id)) continue
      if (c.dependsOn.some((d) => affected.has(d))) {
        affected.add(c.id)
        grew = true
      }
    }
  }

  const moved = [...affected]
    .map((id) => byId.get(id)!)
    .filter(Boolean)
    .map((cue) => ({ cue, from: cue.start, to: shiftTime(cue.start, deltaMin) }))
    .sort((a, b) => toMin(a.from) - toMin(b.from))

  const projected = cues.map((c) => (affected.has(c.id) ? { ...c, start: shiftTime(c.start, deltaMin) } : c))

  const overlaps = (rows: Cue[]): CascadeResult['conflicts'] => {
    const out: CascadeResult['conflicts'] = []
    for (const room of [...new Set(rows.map((c) => c.room))]) {
      const inRoom = rows.filter((c) => c.room === room).sort((a, b) => toMin(a.start) - toMin(b.start))
      for (let i = 0; i < inRoom.length - 1; i++) {
        const a = inRoom[i]
        const b = inRoom[i + 1]
        if (toMin(a.start) + a.durationMin > toMin(b.start)) out.push({ room, a, b })
      }
    }
    return out
  }

  // Only report conflicts this move CREATES. Pre-existing clashes are not this change's fault.
  const before = new Set(overlaps(cues).map((c) => `${c.room}|${c.a.id}|${c.b.id}`))
  const conflicts = overlaps(projected).filter((c) => !before.has(`${c.room}|${c.a.id}|${c.b.id}`))

  const vendorIds = [...new Set(moved.flatMap((m) => m.cue.vendorIds))]
  return { moved, conflicts, vendorIds }
}

export const ROOMS = ['Main Stage', 'Garden Room', 'Cinema 1'] as const

export const CUES: Cue[] = [
  { id: 'c1', room: 'Main Stage', start: '11:00', durationMin: 30, title: 'Opening keynote', owner: 'Alex Morgan', dependsOn: [], vendorIds: ['v-bright', 'v-luma'] },
  { id: 'c2', room: 'Main Stage', start: '11:30', durationMin: 30, title: 'Future of Work 7', owner: 'Alex Morgan', dependsOn: ['c1'], vendorIds: ['v-bright'] },
  { id: 'c3', room: 'Main Stage', start: '12:00', durationMin: 30, title: 'Innovation Lab 4', owner: 'Alex Morgan', dependsOn: ['c2'], vendorIds: ['v-bright'] },
  { id: 'c4', room: 'Main Stage', start: '12:30', durationMin: 45, title: 'Executive Roundtable 10', owner: 'Alex Morgan', dependsOn: ['c3'], vendorIds: ['v-fig'] },
  // Fixed slot — deliberately NOT dependent on the keynote chain, so moving the keynote
  // late enough genuinely collides with it. That collision is the point of the cascade.
  { id: 'c5', room: 'Main Stage', start: '13:30', durationMin: 30, title: 'Customer Stories 13', owner: null, dependsOn: [], vendorIds: [] },
  { id: 'c6', room: 'Garden Room', start: '10:30', durationMin: 30, title: 'Executive Roundtable 5', owner: 'Sam Lee', dependsOn: [], vendorIds: ['v-fig'] },
  { id: 'c7', room: 'Garden Room', start: '11:00', durationMin: 30, title: 'Future of Work 2', owner: 'Sam Lee', dependsOn: [], vendorIds: [] },
  { id: 'c8', room: 'Garden Room', start: '11:30', durationMin: 30, title: 'Customer Stories 8', owner: 'Sam Lee', dependsOn: ['c6'], vendorIds: [] },
  { id: 'c9', room: 'Garden Room', start: '12:00', durationMin: 45, title: 'Leadership Forum 11', owner: 'Sam Lee', dependsOn: ['c8'], vendorIds: ['v-fig'] },
  { id: 'c10', room: 'Garden Room', start: '13:30', durationMin: 30, title: 'Innovation Lab 14', owner: 'Sam Lee', dependsOn: ['c9'], vendorIds: [] },
  { id: 'c11', room: 'Cinema 1', start: '11:00', durationMin: 30, title: 'Innovation Lab 9', owner: 'Jordan Bell', dependsOn: [], vendorIds: ['v-signal'] },
  { id: 'c12', room: 'Cinema 1', start: '11:30', durationMin: 30, title: 'Customer Stories 3', owner: 'Jordan Bell', dependsOn: [], vendorIds: [] },
  { id: 'c13', room: 'Cinema 1', start: '12:00', durationMin: 30, title: 'Leadership Forum 6', owner: 'Jordan Bell', dependsOn: [], vendorIds: [] },
  { id: 'c14', room: 'Cinema 1', start: '12:30', durationMin: 30, title: 'Future of Work 12', owner: 'Jordan Bell', dependsOn: ['c13'], vendorIds: [] },
  { id: 'c15', room: 'Cinema 1', start: '13:00', durationMin: 45, title: 'Executive Roundtable 15', owner: null, dependsOn: ['c14'], vendorIds: ['v-fig'] },
]

/**
 * Vendor contacts. `hasAccount` comes from STAKEHOLDERS in the product seed — Marta and Noah
 * are explicitly false there, and Eli has no stakeholder record at all. None of the three can
 * be reached by asking them to log in, which is exactly the point of scoped share links.
 */
export const VENDORS: Record<string, { name: string; category: string; contact: string; channel: string }> = {
  'v-bright': { name: 'BrightStage AV', category: 'AV production', contact: 'Marta Nowak', channel: 'Email' },
  'v-luma': { name: 'LumaWorks', category: 'Lighting', contact: 'Eli Turner', channel: 'Email' },
  'v-fig': { name: 'Fig & Vine', category: 'Catering', contact: 'Noah Williams', channel: 'Email' },
  'v-signal': { name: 'Signal House', category: 'Connectivity', contact: 'Owen Scott', channel: 'Email' },
}
