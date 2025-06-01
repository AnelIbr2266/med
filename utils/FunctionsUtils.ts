export function isJson(str: string) {
    try {
        const status = JSON.parse(str);
        return status.name;
    } catch (e) {
        return str;
    }
}

export function replaceNbsps(str: any) {
    const re = new RegExp(String.fromCharCode(160), "g");
    return str.replace(re, " ");
}