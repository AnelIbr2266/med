import {db} from "@/sql/db";
import {IAppTochki} from "@/types/Tochki";

const sqlTochki = () => {
    const elm_table = "tochki";
    const getTochki = async (select: string, query: string): Promise<{ app_tochki: IAppTochki[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({app_tochki: result, error: null});
                    } else {
                        resolve({ app_tochki: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_tochki: null, error: error.message });
                });
        });
    };

    const getTochkiQuery = async (select: string, join: string, query: string | null): Promise<{app_tochki: IAppTochki[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM ${elm_table} ${join} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({app_tochki: result, error: null});
                    } else {
                        resolve({ app_tochki: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_tochki: null, error: error.message });
                });
        });
    };

    const getTochkiOne = async (select: string, query: string): Promise<{ app_tochka: IAppTochki | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getFirstAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result) {
                        resolve({ app_tochka: result, error: null });
                    } else {
                        resolve({ app_tochka: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_tochka: null, error: error.message });
                });
        });
    };

    return {getTochki, getTochkiQuery, getTochkiOne}
};

export default sqlTochki;