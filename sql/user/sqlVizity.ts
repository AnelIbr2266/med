import {db} from "@/sql/db";
import {IAppVizity, IVizity, IVizityAddReturn} from "@/types/Vizity";
import axios from "axios";
import sqlAkciya from "@/sql/user/sqlAkciya";
import sqlOprosnik from "@/sql/user/sqlOprosnik";
import sqlDeteiling from "@/sql/user/sqlDeteiling";
import sqlPostponed from "@/sql/user/sqlPostponed";
import {URL_MODEL_API} from "@/context/config";


const sqlVizity = () => {
    const {getAkciyaQuery}  = sqlAkciya();
    const {getOprosnikQuery}  = sqlOprosnik();
    const {getDeteilingQuery}  = sqlDeteiling();
    const {akciyaPostponed, oprosnikPostponed, deteilingPostponed}  = sqlPostponed();
    const elm_table = "vizity";

    const getVizityQuery = async (select: string, query: string | null):
        Promise<{app_vizity: IAppVizity[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({app_vizity: result, error: null});
                    } else {
                        resolve({ app_vizity: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_vizity: null, error: error.message });
                });
        });
    };

    const getVizityOne = async (select: string, query: string): Promise<{app_vizit: IAppVizity | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getFirstAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result) {
                        resolve({ app_vizit: result, error: null });
                    } else {
                        resolve({ app_vizit: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_vizit: null, error: error.message });
                });
        });
    };

    const addElmaVizity = async (userId: string, fields: any): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const post_data = JSON.stringify({userId: userId, fields: fields});

            const data: IAppVizity[] = await axios.post(`${URL_MODEL_API}/add_vizity`, post_data)
                .then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null;
                });

            if(data) {
                const arrArgs: any = [];
                const arrNames: string[] = [];
                const arrValues: any = []
                for (const [key, value] of Object.entries(data[0])) {
                    arrArgs.push("'"+value+"'");
                    arrNames.push("elm_" + key);
                }
                arrValues.push(`(${arrArgs.join(',')})`);
                if (arrValues.length > 0) {
                    const sql = `INSERT INTO ${elm_table} (${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                    await (await db).runAsync(sql, arrArgs).then(({lastInsertRowId}) => {
                        if (lastInsertRowId) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }).catch((error) => {
                        if (error.message.includes("UNIQUE")) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                }
            } else {
                resolve(false);
            }
        });
    };

    const updateElmaVizity = async (userId: string, field: IAppVizity): Promise<any> => {
        return await new Promise(async (resolve) => {
            const post_data = JSON.stringify({userId: userId, field: field});

            const data: IVizity[] = await axios.post(`${URL_MODEL_API}/update_vizity`, post_data)
                .then((response) => {
                    return JSON.parse(response.data.data);
                }).catch((err) => {
                    return null;
                });

            if(data) {
                data[0]["__status"] = field.elm___status;

                const arrArgs: any = [];
                const arrSets: any = [];
                for (const [key, value] of Object.entries(data[0])) {
                    if(key === "__id") continue;
                    arrSets.push(`${"elm_" + key} = ?`);
                    arrArgs.push(value);
                }

                if (arrArgs.length > 0) {
                    const sql = `UPDATE ${elm_table} SET ${arrSets.join(', ')} WHERE elm___id = '${data[0].__id}';`;
                    await (await db).runAsync(sql, arrArgs).then(({changes}) => {
                        if (changes) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }).catch(() => {
                        resolve(false);
                    });
                }
            } else {
                resolve(false);
            }
        });
    };


    const updateAppVizit = async (fields: any , vizit_id: number): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const obj = {} as any;
            const arrArgs: any = []
            const arrSets: any = []
            Object.keys(fields).forEach((key) => {
                const value = typeof fields[key] === "object" ? JSON.stringify(fields[key]) : fields[key];
                obj["elm_" + key] = value;
                arrSets.push(`${"elm_" + key} = ?`);

                if(key === "__status") {
                    arrArgs.push(fields[key].name);
                } else {
                    arrArgs.push(value);
                }
            });

            if (arrArgs.length > 0) {
                const sql = `UPDATE ${elm_table} SET ${arrSets.join(', ')} WHERE id = '${vizit_id}';`;
                await (await db).runAsync(sql, arrArgs).then(({changes}) => {
                    if (changes) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(() => {
                    resolve(false);
                });
            }
        });
    };

    const saveAppVizit = async (fields: any , vizit_id: number): Promise<boolean> => {
        return await new Promise(async (resolve) => {

            const obj = {} as any;
            const arrArgs: any = []
            const arrSets: any = []
            Object.keys(fields).forEach((key) => {
                const value = typeof fields[key] === "object" ? JSON.stringify(fields[key]) : fields[key];
                obj["elm_" + key] = value;
                arrSets.push(`${"elm_" + key} = ?`);
                arrArgs.push(value);
            });

            const sql = `UPDATE ${elm_table} SET ${arrSets.join(', ')} WHERE id = '${vizit_id}';`;
            await (await db).runAsync(sql, arrArgs).then(({changes}) => {
                if (changes) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(() => {
                resolve(false);
            });
        });
    };

    const saveElmaVizity = async (userId: string, fields: any[]): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const field = fields[0];

            const vizit: any = await new Promise(async (resolve) => {
                await getVizityQuery("*", `AND elm_postponed = "1" AND id = ${field.id}`).then(async ({app_vizity}) => {
                    if (app_vizity) {
                        app_vizity[0].elm___status = field.elm___status;
                        const post_data = JSON.stringify({userId: userId, field: app_vizity[0]});

                        const data: IVizityAddReturn[] = await axios.post(`${URL_MODEL_API}/save_vizity`, post_data)
                            .then((response) => {
                                return JSON.parse(response.data.data);
                            }).catch(() => {
                                return null;
                            });

                        if(data) {
                            await (await db).runAsync(
                                `UPDATE vizity SET elm_postponed = ?, elm___id = ? WHERE id = ?;`,
                                ["", String(data[0].vizit_id), data[0].id]
                            ).then(({changes}) => {
                                if (changes) {
                                    resolve({
                                        app_vizity: app_vizity[0],
                                        data: data[0],
                                    });
                                } else {
                                    resolve(false);
                                }
                            }).catch(() => {
                                resolve(false);
                            });
                        } else {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });
            });

            if(vizit) {
                const app_vizit = vizit.app_vizity;
                const sql = `AND elm_postponed = "1" AND elm_vizit_id = "${app_vizit.id}"`;
                await getAkciyaQuery('*', sql).then(async ({app_akciya}) => {
                    if (app_akciya) {
                        await akciyaPostponed(userId, app_akciya, app_vizit);
                    }
                });

                await getOprosnikQuery('*', sql).then(async ({app_oprosnik}) => {
                    if(app_oprosnik) {
                        await oprosnikPostponed(userId, app_oprosnik, app_vizit);
                    }
                });

                await getDeteilingQuery('*', sql).then(async ({app_deteiling}) => {
                    if(app_deteiling) {
                        await deteilingPostponed(userId, app_deteiling);
                    }
                });
                resolve(true);
            } else {
                resolve(true);
            }
        });
    };




    return {getVizityQuery, getVizityOne, updateAppVizit, saveAppVizit, saveElmaVizity, addElmaVizity, updateElmaVizity}
};

export default sqlVizity;