export const getQueryFilter = (table: string, kategoriya: string, akciya: boolean, search: string) => {
    let query = ``;
    if (search === '') {
        if(!kategoriya) {
            if(!akciya) {
                query = ``;
            } else {
                query = `AND ${table}.elm_akciya != ""`;
            }
        } else {
            if(!akciya) {
                query = `AND ${table}.elm_kategoriya = "${kategoriya}"`;
            } else {
                query = `AND ${table}.elm_kategoriya = "${kategoriya}" AND ${table}.elm_akciya != ""`;
            }
        }
    } else {
        if (!kategoriya) {
            if (!akciya) {
                query = `AND ${table}.elm___name LIKE "%${search}%"`;
            } else {
                query = `AND ${table}.elm___name LIKE "%${search}%" AND ${table}.elm_akciya != ""`;
            }
        } else {
            if (!akciya) {
                query = `AND ${table}.elm___name LIKE "%${search}%" AND ${table}.elm_kategoriya = "${kategoriya}"`;
            } else {
                query = `AND ${table}.elm___name LIKE "%${search}%" AND ${table}.elm_kategoriya = "${kategoriya}" AND ${table}.elm_akciya != ""`;
            }
        }
    }
    return query;
}

