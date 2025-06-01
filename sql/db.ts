import * as SQLite from "expo-sqlite";
import {APP_DB} from "@/context/config";

export const db = SQLite.openDatabaseAsync(APP_DB);

export const createTable = async (sql_drop: string, sql_create: string): Promise<boolean> => {
    return await new Promise(async (resolve) => {
        // await (await db).execAsync(sql_drop);
        await (await db).execAsync(sql_create)
            .then((result) => {
                resolve(true);
            }).catch((error) => {
                resolve(false);
            });
    });
}

export const deleteAllTables = async (): Promise<boolean> => {
    return await new Promise(async (resolve) => {
        await (await db).getAllAsync(`SELECT name FROM sqlite_master WHERE type='table'`)
            .then(async (result: any) => {
                for (const row of result) {
                    if (row.name === "name") continue;
                    await (await db).runAsync(`DROP TABLE IF EXISTS ${row.name};`);
                }
            }).catch(() => {
                resolve(false);
            });
        resolve(true);
    });
}