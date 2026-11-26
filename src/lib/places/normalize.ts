/** Lowercase and strip accents, so "san jose" matches "San José". */
export const normalize = (text: string) =>
    text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();
