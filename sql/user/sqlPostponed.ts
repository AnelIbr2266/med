import {db} from "@/sql/db";
import axios from "axios";
import {IAppVizity} from "@/types/Vizity";
import {IAkciya, IAppAkciya} from "@/types/Akciya";
import sqlAkciya from "@/sql/user/sqlAkciya";
import sqlOprosnik from "@/sql/user/sqlOprosnik";
import sqlDeteiling from "@/sql/user/sqlDeteiling";
import * as ImageManipulator from "expo-image-manipulator";
import {IAppOprosnik, IOprosnikAddReturn} from "@/types/Oprosnik";
import {IAppDeteiling, IDeteilingAddReturn} from "@/types/Deteiling";
import {URL_MODEL_API} from "@/context/config";
import {useAuth} from "@/context/AuthContext";

async function groupBy(sql: string) {
    const arr = [] as any;
    await (await db).getAllAsync(sql)
        .then(async (result) => {
            if (result.length > 0) {
                const groupBy = result.reduce((group: any, item: any) => {
                    const {elm_id_vizita} = item;
                    group[elm_id_vizita] = group[elm_id_vizita] ?? [];
                    group[elm_id_vizita].push(item.id);
                    return group;
                }, {});
                arr.push(groupBy)
            }
        });
    return arr.length ? arr[0] : null
}


const sqlPostponed = () => {

    const {getSetIsVizityAdd}  = useAuth();
    const {getAkciyaQuery}  = sqlAkciya();
    const {getOprosnikQuery}  = sqlOprosnik();
    const {getDeteilingQuery}  = sqlDeteiling();


    const selectAkciyaPostponed = async (vizity_id: string): Promise<any[] | null> => {
        return await new Promise(async (resolve) => {
            // Akciya
            const sql = `SELECT akciya_na_pokupatelya.id, akciya_na_pokupatelya.elm_id_vizita, vizity.elm___id AS vizit_id
                        FROM akciya_na_pokupatelya
                        LEFT JOIN vizity ON vizity.elm___id = akciya_na_pokupatelya.elm_id_vizita
                        WHERE akciya_na_pokupatelya.elm_postponed = "1"
                        AND akciya_na_pokupatelya.elm_id_vizita = "${vizity_id}"`;

            resolve(await groupBy(sql));
        });
    };

    const selectOprosnikPostponed = async (vizity_id: string): Promise<any[] | null> => {
        return await new Promise(async (resolve) => {
            const sql = `SELECT brand_sku_oprosnik.id, brand_sku_oprosnik.elm_id_vizita, vizity.elm___id AS vizit_id 
                        FROM brand_sku_oprosnik 
                        LEFT JOIN vizity ON vizity.elm___id = brand_sku_oprosnik.elm_id_vizita 
                        WHERE brand_sku_oprosnik.elm_postponed = "1"
                        AND brand_sku_oprosnik.elm_id_vizita = "${vizity_id}"`;

            resolve(await groupBy(sql));
        });
    };

    const selectDeteilingPostponed = async (vizity_id: string): Promise<any[] | null> => {
        return await new Promise(async (resolve) => {
            const sql = `SELECT deteiling.id, deteiling.elm_id_vizita, vizity.elm___id AS vizit_id 
                        FROM deteiling 
                        LEFT JOIN vizity ON vizity.elm___id = deteiling.elm_id_vizita 
                        WHERE deteiling.elm_postponed = "1"
                        AND deteiling.elm_id_vizita = "${vizity_id}"`;

            resolve(await groupBy(sql));
        });
    };



    const checkPostponed = async (): Promise<any | null> => {
        return await new Promise(async (resolve) => {
            const arrAll = [] as any;
            const arrVizitPostponed: number[] = [];
            // Akciya
            const sql_akc = `SELECT akciya_na_pokupatelya.*, vizity.elm___id AS vizit_id FROM akciya_na_pokupatelya LEFT JOIN vizity ON vizity.elm___id = akciya_na_pokupatelya.elm_id_vizita WHERE akciya_na_pokupatelya.elm_postponed = "1" AND vizity.elm___status != "План"`;
            const akciya = await groupBy(sql_akc);
            if(akciya) {
                arrAll.push({akciya: akciya})
            }

            // Oprosnik
            const sql_op = `SELECT brand_sku_oprosnik.*, vizity.elm___id AS vizit_id FROM brand_sku_oprosnik LEFT JOIN vizity ON vizity.elm___id = brand_sku_oprosnik.elm_id_vizita WHERE brand_sku_oprosnik.elm_postponed = "1" AND vizity.elm___status != "План"`;
            const oprosnik = await groupBy(sql_op);
            if(oprosnik) {
                arrAll.push({oprosnik: oprosnik})
            }

            // Deteiling
            const sql_d = `SELECT deteiling.*, vizity.elm___id AS vizit_id FROM deteiling LEFT JOIN vizity ON vizity.elm___id = deteiling.elm_id_vizita WHERE deteiling.elm_postponed = "1" AND vizity.elm___status != "План"`;
            const deteiling = await groupBy(sql_d);
            if(deteiling) {
                arrAll.push({deteiling: deteiling})
            }

            await getVizityQueryP("id", `AND elm_postponed = "1" AND elm___status != "План"`).then(async ({app_vizity}) => {
                if (app_vizity) {
                    for (const vizit of app_vizity) {
                        arrVizitPostponed.push(vizit.id);
                    }
                }
            });

            const obj = {} as any;
            if(arrAll.length) {
                obj["all"] = arrAll;
            }
            if(arrVizitPostponed.length) {
                obj["vizity"] = arrVizitPostponed;
            }

            if(Object.keys(obj).length > 0) {
                resolve(obj);
            } else {
                resolve(null);
            }
        });
    };




    const getVizityQueryP = async (select: string, query: string | null): Promise<{app_vizity: IAppVizity[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM vizity WHERE 1=1 ${query}`)
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


    const savePostponed = async (userId: string, fields: any): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const save =  await new Promise(async (resolve) => {
                if(fields.all) {
                    for (const field of fields.all) {
                        for (const [key] of Object.entries(field)) {
                            // akciya
                            if(key === "akciya") {
                                const arIds: string[] = [];
                                Object.keys(field[key]).forEach(key => {
                                    arIds.push(`"${key}"`);
                                });

                                await getVizityQueryP("*", `AND elm___id IN (${arIds.join(", ")})`).then(async ({app_vizity}) => {
                                    if (app_vizity) {
                                        for (const vizit of app_vizity) {
                                            if(vizit.elm___id) {
                                                await getAkciyaQuery('*', `AND id IN (${field[key][vizit.elm___id].join(", ")}) AND elm_postponed = "1"`).then(async ({app_akciya}) => {
                                                    if (app_akciya) {
                                                        await akciyaPostponed(userId, app_akciya, vizit);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }

                            // oprosnik
                            if(key === "oprosnik") {
                                const arIds: string[] = [];
                                Object.keys(field[key]).forEach(key => {
                                    arIds.push(`"${key}"`);
                                });

                                await getVizityQueryP("*", `AND elm___id IN (${arIds.join(", ")})`).then(async ({app_vizity}) => {
                                    if (app_vizity) {
                                        for (const vizit of app_vizity) {
                                            if(vizit.elm___id) {
                                                await getOprosnikQuery('*', `AND id IN (${field[key][vizit.elm___id].join(", ")}) AND elm_postponed = "1"`).then(async ({app_oprosnik}) => {
                                                    if (app_oprosnik) {
                                                        await oprosnikPostponed(userId, app_oprosnik, vizit);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }

                            // oprosnik
                            if(key === "deteiling") {
                                const arIds: string[] = [];
                                Object.keys(field[key]).forEach(key => {
                                    arIds.push(`"${key}"`);
                                });

                                await getVizityQueryP("*", `AND elm___id IN (${arIds.join(", ")})`).then(async ({app_vizity}) => {
                                    if (app_vizity) {
                                        for (const vizit of app_vizity) {
                                            if(vizit.elm___id) {
                                                await getDeteilingQuery('*', `AND id IN (${field[key][vizit.elm___id].join(", ")}) AND elm_postponed = "1"`).then(async ({app_deteiling}) => {
                                                    if (app_deteiling) {
                                                        await deteilingPostponed(userId, app_deteiling);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }

                resolve(true);
            });


            if(save) {
                const update: boolean =  await new Promise(async (resolve) => {
                    await getVizityQueryP("*", `AND elm_postponed = "1"`).then(async ({app_vizity}) => {
                        if (app_vizity) {
                            for (const vizit of app_vizity) {
                                const checkAkciya = await selectAkciyaPostponed(vizit.elm___id);
                                const checkOprosnik = await selectOprosnikPostponed(vizit.elm___id);
                                const checkDeteiling = await selectDeteilingPostponed(vizit.elm___id);

                                if(!checkAkciya && !checkOprosnik && !checkDeteiling) {
                                    await updateElmaVizity(userId, vizit).then(async (output) => {
                                        if (output) {
                                            const field: any = {
                                                postponed: "",
                                                vizit_id: vizit.id
                                            }
                                            await vizitPostponed(field).then((result) => {
                                                if(result) {
                                                    getSetIsVizityAdd(Date.now());
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        }
                    });
                    resolve(true);
                });
                resolve(update);
            }


        });
    };

    const updateElmaVizity = async (userId: string, field: IAppVizity): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const post_data = JSON.stringify({userId: userId, field: field});
            await axios.post(`${URL_MODEL_API}/update_vizity_new`, post_data)
                .then(() => {
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                });
        });
    };



    const vizitPostponed = async (field: any): Promise<any> => {
        return await new Promise(async (resolve) => {
            await (await db).runAsync(
                `UPDATE vizity SET elm_postponed = ? WHERE id = ?;`,
                [field.postponed, field.vizit_id])
                .then(() => {
                    resolve(true);
                }).catch(() => {
                    resolve(false);
                });
        });
    };

    const akciyaPostponed = async (userId: string, app_akciya: IAppAkciya[], app_vizit: IAppVizity): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            for (const akciya of  app_akciya) {
                // Фото
                if (akciya.elm_foto) {
                    const arrImages = [] as any;
                    const images = JSON.parse(akciya.elm_foto);
                    for (const image of images) {
                        const resize = await ImageManipulator.manipulateAsync(
                            image.uri,
                            [],
                            {base64: true}
                        );
                        arrImages.push(resize)
                    }
                    akciya.elm_foto = JSON.stringify(arrImages);
                }

                const fields = {} as any
                Object.fromEntries(Object.entries(app_vizit).filter(([key, value]) => {
                    if (key.toLowerCase().includes("elm_oprosnik_")
                        && key.toLowerCase().includes("akciya_na_pokupatelya")
                        && value && String(akciya.id) === value) {
                        const bindings_code = key.split("elm_")[1];
                        Object.assign(fields, {[bindings_code]: akciya});
                    }
                }));

                if (Object.keys(fields).length > 0) {
                    const post_data = JSON.stringify({userId: userId, fields: fields});
                    const data: IAkciya[] = await axios.post(`${URL_MODEL_API}/add_akcii`, post_data)
                        .then((response) => {
                            return JSON.parse(response.data.data);
                        }).catch(() => {
                            return null;
                        });

                    if (data) {
                        await (await db).runAsync(
                            `UPDATE akciya_na_pokupatelya SET elm_postponed = ? WHERE id = ?;`,
                            ["", akciya.id]);
                    }
                }
            }
            resolve(true);
        });
    };

    const oprosnikPostponed = async (userId: string, app_oprosnik: IAppOprosnik[], app_vizit: IAppVizity): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            for (const oprosnik of app_oprosnik) {
                if (oprosnik.elm_prikrepit_foto_vykladki) {
                    const arrImages = [] as any;
                    const images = JSON.parse(oprosnik.elm_prikrepit_foto_vykladki);
                    for (const image of images) {
                        const resize = await ImageManipulator.manipulateAsync(
                            image.uri,
                            [],
                            {base64: true}
                        );
                        arrImages.push(resize)
                    }
                    oprosnik.elm_prikrepit_foto_vykladki = JSON.stringify(arrImages);
                }

                const fields = {} as any
                Object.fromEntries(Object.entries(app_vizit).filter(([key, value]) => {
                    if (key.toLowerCase().includes("elm_brand_sku_oprosnik_")
                        && value
                        && String(oprosnik.id) === value
                    ) {
                        const bindings_code = key.split("elm_")[1];
                        Object.assign(fields, {[bindings_code]: oprosnik});
                    }
                }));

                if(Object.keys(fields).length > 0) {
                    const post_data = JSON.stringify({userId: userId, fields: fields});
                    const data: IOprosnikAddReturn[] = await axios.post(`${URL_MODEL_API}/add_oprosnik`, post_data)
                        .then((response) => {
                            return JSON.parse(response.data.data);
                        }).catch(() => {
                            return null;
                        });

                    if(data) {
                        await (await db).runAsync(
                            `UPDATE brand_sku_oprosnik SET elm_postponed = ? WHERE id = ?;`,
                            ["", oprosnik.id]);
                    }
                }
            }
            resolve(true);
        });
    };

    const deteilingPostponed = async (userId: string, app_deteiling: IAppDeteiling[]): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            for (const deteiling of  app_deteiling) {
                const post_data = JSON.stringify({userId: userId, field: deteiling});
                const data: IDeteilingAddReturn[] = await axios.post(`${URL_MODEL_API}/add_deteiling`, post_data)
                    .then((response) => {
                        return JSON.parse(response.data.data);
                    }).catch(() => {
                        return null;
                    });

                if(data) {
                    await (await db).runAsync(
                        `UPDATE deteiling SET elm_postponed = ? WHERE id = ?;`,
                        ["", deteiling.id]);
                }
            }
            resolve(true);
        });
    };



    return {checkPostponed, savePostponed, akciyaPostponed, oprosnikPostponed, deteilingPostponed,
        selectAkciyaPostponed,
        selectOprosnikPostponed,
        selectDeteilingPostponed,
        getVizityQueryP,
        vizitPostponed
    }
};

export default sqlPostponed;