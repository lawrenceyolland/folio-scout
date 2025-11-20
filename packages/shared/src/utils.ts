export function now() {
    return Date.now();
}

export function generateId(prefix: string = "job") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}