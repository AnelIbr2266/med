
export function convertDate(date: string) {
    const created = new Date(Number(date));
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    } as any
    return  created.toLocaleDateString('ru-RU', options);
}

export function convertTime(date: string) {
    const created = new Date(Number(date));
    const options = {
        hour: '2-digit',
        minute:'2-digit'
    } as any

    return  created.toLocaleTimeString('ru-RU', options);
}
