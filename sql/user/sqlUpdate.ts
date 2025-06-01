import {db} from "@/sql/db";
import axios from "axios";
import {URL_MODEL_API} from "@/context/config";

const checkSqlResult = async (table_name: string[]): Promise<any> => {
    return await new Promise(async (resolve) => {
        if(table_name.length > 0) {
            const arr = [] as any;
            for (const table of table_name) {
                const sql = `SELECT elm___updatedAt FROM ${table} GROUP BY elm___updatedAt ORDER BY elm___updatedAt DESC LIMIT 1`;
                await (await db).getFirstAsync(sql)
                    .then((result: any) => {
                        if(result) {
                            arr.push({[table]: result.elm___updatedAt})
                        }
                    }).catch(() => true);
            }

            if(arr.length > 0) {
                resolve(arr);
            } else {
                resolve(false);
            }
        } else {
            resolve(false);
        }
    });
}


const sqlUpdate = () => {
    const getCheckQuery = async (userId: string): Promise<any> => {
        return await new Promise(async (resolve) => {
            const result = await checkSqlResult([
                "tochki", "deteiling_kartinki",
            ]);
            if(result) {
                const data = await axios.post(`${URL_MODEL_API}/check_update`, {
                    userId: userId,
                    fields: result,
                }).then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null;
                });

                if(data) {
                    resolve(data);
                } else {
                    resolve(false);
                }
            }
        });
    };

    const getElmaNewVizity = async (userId: string, date: string, table: string): Promise<boolean> => {
        const elm_table = "vizity";
        return await new Promise(async (resolve) => {
            const data: any[] = await axios.post(`${URL_MODEL_API}/get_new_data`, {
                userId: userId,
                from: 0,
                size: 10000,
                date: date,
                table: table
            }).then((response) => {
                return JSON.parse(response.data.data);
            }).catch(() => {
                return null;
            });

            if(data) {
                const chunkSize = 1000;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);

                    for (const item of chunk) {
                        const obj = {} as any;
                        const arrArgs: any = []
                        const arrSets: any = []
                        for (const [key, value] of Object.entries(item)) {
                            obj["elm_" + key] = value;
                            arrSets.push(`${"elm_" + key} = ?`);
                            arrArgs.push(value);
                        }

                        const sql = `UPDATE ${elm_table} SET ${arrSets.join(', ')} WHERE elm___id = '${item.__id}';`;
                        await (await db).runAsync(sql, arrArgs).catch(() => false);
                    }
                }
                resolve(true);
            } else {
                resolve(false);
            }
        });
    };

    const getElmaNewTochki = async (userId: string, date: string, table: string): Promise<boolean> => {
        const elm_table = "tochki";
        return await new Promise(async (resolve) => {
            const data: any[] = await axios.post(`${URL_MODEL_API}/get_new_data`, {
                userId: userId,
                from: 0,
                size: 10000,
                date: date,
                table: table
            }).then((response) => {
                return JSON.parse(response.data.data);
            }).catch(() => {
                return null;
            });

            if(data) {
                const chunkSize = 1000;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data[0].slice(i, i + chunkSize);

                    for (const item of chunk) {
                        const obj = {} as any;
                        const arrArgs: any = []
                        const arrSets: any = []
                        for (const [key, value] of Object.entries(item)) {
                            obj["elm_" + key] = value;
                            arrSets.push(`${"elm_" + key} = ?`);
                            arrArgs.push(value);
                        }

                        const sql = `UPDATE ${elm_table} SET ${arrSets.join(', ')} WHERE elm___id = '${item.__id}';`;
                        await (await db).runAsync(sql, arrArgs).catch(() => false);
                    }
                }
                resolve(true);
            } else {
                resolve(false);
            }


        });
    };

    const getElmaNewAkciya = async (userId: string, date: string, table: string): Promise<boolean> => {
        const elm_table = "akciya_na_pokupatelya";
        return await new Promise(async (resolve) => {
            const data: any[] = await axios.post(`${URL_MODEL_API}/get_new_data`, {
                userId: userId,
                from: 0,
                size: 10000,
                date: date,
                table: table
            }).then((response) => {
                return JSON.parse(response.data.data);
            }).catch(() => {
                return null;
            });

            if(data) {
                const chunkSize = 1000;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);

                    for (const item of chunk) {
                        const obj = {} as any;
                        const arrArgs: any = []
                        const arrSets: any = []
                        for (const [key, value] of Object.entries(item)) {
                            if(key === "__id") continue;

                            obj["elm_" + key] = value;
                            arrSets.push(`${"elm_" + key} = ?`);

                            if(["foto"].includes(key)) {
                                if(item["foto"]) {
                                    arrArgs.push("have");
                                } else {
                                    arrArgs.push(value);
                                }
                            } else {
                                arrArgs.push(value);
                            }
                        }

                        const sql = `UPDATE ${elm_table} SET ${arrSets.join(', ')} WHERE elm___id = '${item.__id}';`;
                        await (await db).runAsync(sql, arrArgs).catch(() => false);
                    }
                }
                resolve(true);
            } else {
                resolve(false);
            }
        });
    };




    return {getCheckQuery,
        getElmaNewVizity,
        getElmaNewTochki,
        getElmaNewAkciya,
    }
};

export default sqlUpdate;