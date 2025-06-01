import {db} from "@/sql/db";
import {IAppVizity} from "@/types/Vizity";
import {IAppDeteiling} from "@/types/Deteiling";


const sqlDeteiling = () => {
    const elm_table = "deteiling";

    const getDeteilingQuery = async (select: string, query: string | null): Promise<{app_deteiling: IAppDeteiling[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({app_deteiling: result, error: null});
                    } else {
                        resolve({ app_deteiling: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_deteiling: null, error: error.message });
                });
        });
    };


    const addAppDeteiling = async (fields: any, vizit: IAppVizity): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elmaFields = [] as any;
            const arrArgs: any = [];
            const arrNames: string[] = [];
            const arrValues: any = []

            fields["apt_id"] = vizit.elm_apt_id;
            fields["municipalnyi_raion"] = vizit.elm_municipalnyi_raion;
            fields["adres_apteki"] = vizit.elm_adres_apteki;
            fields["kategoriya"] = vizit.elm_kategoriya;
            fields["set"] = vizit.elm_set;
            fields["id_vizita"] = vizit.elm___id;
            fields["postponed"] = "1";

            for (const [key, value] of Object.entries(fields)) {
                arrArgs.push("'"+value+"'");
                arrNames.push("elm_" + key);
            }

            arrValues.push(`(${arrArgs.join(',')})`);
            if (arrValues.length > 0) {
                const sql = `INSERT INTO ${elm_table} (${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                await (await db).runAsync(sql, arrValues).then(async ({lastInsertRowId}) => {
                    if (lastInsertRowId) {
                        await (await db).runAsync(
                            `UPDATE ${elm_table} SET elm_deteiling = ? WHERE id = ?;`,
                            [String(lastInsertRowId), vizit.id]);
                        await (await db).runAsync(
                            `UPDATE vizity SET elm_deteiling = ? WHERE elm___id = ?;`,
                            [String(lastInsertRowId), vizit.elm___id]);

                        elmaFields.push(true);
                    }
                });
            }

            if(elmaFields.length > 0) {
                resolve(true);
            } else {
                resolve(true);
            }
        });
    };

    return {addAppDeteiling, getDeteilingQuery}
};

export default sqlDeteiling;