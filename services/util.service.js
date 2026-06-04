export function makeId(prefix) {
    const pfx = prefix ? `${prefix}_` : ''
    return `${pfx}${Math.random().toString(36).substring(2, 8)}`
}