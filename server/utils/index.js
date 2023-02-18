
export function makeArray(val) {
    if(Array.isArray(val)) {
        return val;
    }
    if(val === null || val === undefined) {
        return [];
    }
    return [val];
}
