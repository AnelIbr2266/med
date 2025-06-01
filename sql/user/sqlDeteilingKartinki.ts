import {db} from "@/sql/db";
import {IAppDeteilingKartinki} from "@/types/DeteilingKartinki";


const sqlDeteilingKartinki = () => {
    const elm_table = "deteiling_kartinki";
    const getDeteilingKartinkiQuery = async (select: string, query: string | null): Promise<{app_kartinki: IAppDeteilingKartinki | null, error: string | null}> => {
        return  await new Promise(async (resolve) => {
            await (await db).getFirstAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result) {
                        resolve({ app_kartinki: result, error: null });
                    } else {
                        resolve({ app_kartinki: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_kartinki: null, error: error.message });
                });
        });
    };

    return {getDeteilingKartinkiQuery}
};

export default sqlDeteilingKartinki;