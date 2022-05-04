export function validURL(str: string): boolean {
    try {
        new URL(str);
    } catch (_) {
        return false;
    }
    return true;
}
