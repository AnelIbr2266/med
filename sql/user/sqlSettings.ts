import {db} from "@/sql/db";
import {IAppSettings} from "@/types/Settings";

const sqlSettings = () => {
    const getSettings = async (select: string, query: string): Promise<{ app_settings: IAppSettings[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM settings WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({
                            app_settings: result,
                            error: null
                        });
                    } else {
                        resolve({ app_settings: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_settings: null, error: error.message });
                });
        });
    };

    return {getSettings}
};

export default sqlSettings;