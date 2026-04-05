import mdiGlyphMap from "@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";

const mdiIconNames = new Set(Object.keys(mdiGlyphMap as Record<string, number>));
const mdiKeysSortedByLength = [...mdiIconNames].sort((a, b) => b.length - a.length);

/** Short MDI names that are too generic for substring matching. */
const GENERIC_MDI_KEYS = new Set([
    "app",
    "alpha",
    "beta",
    "box",
    "card",
    "cash",
    "circle",
    "cloud",
    "credit",
    "go",
    "mail",
    "max",
    "music",
    "news",
    "one",
    "pay",
    "play",
    "plus",
    "pro",
    "star",
    "store",
    "tv",
    "video",
    "web",
]);

const resolveCache = new Map<string, string | null>();

function normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ");
}

/**
 * Map a subscription name to a MaterialCommunityIcons glyph name when possible.
 * Uses the same icon font already shipped with Expo (~7k icons).
 */
export function resolveSubscriptionMdiIcon(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const cached = resolveCache.get(trimmed);
    if (cached !== undefined) return cached;

    const norm = normalizeName(trimmed);
    const tokens = norm.split(/\s+/).filter(Boolean);
    const collapsed = norm.replace(/\s+/g, "");

    let best: string | null = null;

    const tryToken = (t: string, allowGeneric: boolean) => {
        if (t.length < 3 || !mdiIconNames.has(t)) return;
        if (!allowGeneric && GENERIC_MDI_KEYS.has(t)) return;
        if (!best || t.length > best.length) best = t;
    };

    const sortedTokens = [...tokens].sort((a, b) => b.length - a.length);
    for (const t of sortedTokens) tryToken(t, false);
    if (!best) for (const t of sortedTokens) tryToken(t, true);

    if (!best) {
        for (let i = 0; i < tokens.length - 1; i++) {
            const key = `${tokens[i]}-${tokens[i + 1]}`;
            if (mdiIconNames.has(key)) {
                best = key;
                break;
            }
        }
    }

    if (!best) {
        const trySubstring = (skipGeneric: boolean) => {
            for (const key of mdiKeysSortedByLength) {
                if (key.length < 4) continue;
                if (skipGeneric && GENERIC_MDI_KEYS.has(key)) continue;
                const spaced = key.replace(/-/g, " ");
                const compact = key.replace(/-/g, "");
                if (norm.includes(spaced) || collapsed.includes(compact)) {
                    return key;
                }
            }
            return null;
        };
        best = trySubstring(true) ?? trySubstring(false);
    }

    resolveCache.set(trimmed, best);
    return best;
}
