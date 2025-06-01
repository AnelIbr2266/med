import {db} from "@/sql/db";
import axios from "axios";
import sqlSettings from "@/sql/user/sqlSettings";
import {IAppOprosnik} from "@/types/Oprosnik";
import {MAIN_FOLDER, URL_MODEL_API} from "@/context/config";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";


const sqlOprosnik = () => {
    const {getSettings} = sqlSettings();
    const elm_table = "brand_sku_oprosnik";

    const getOprosnikQuery = async (select: string, query: string | null): Promise<{app_oprosnik: IAppOprosnik[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({app_oprosnik: result, error: null});
                    } else {
                        resolve({ app_oprosnik: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_oprosnik: null, error: error.message });
                });
        });
    };

    const addAppOprosnik = async (fields: any[], vizit_id: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            getSettings('*', `AND elm_table = "oprosnik"`).then(async ({app_settings}) => {
                if (app_settings) {
                    const elmaFields: [] = await new Promise(async (resolve): Promise<any> => {
                        const elm_fields = JSON.parse(app_settings[0].elm_fields);
                        Object.assign(elm_fields, {300: {
                                "name": "Отложенные",
                                "code": "postponed"
                            }});

                        const elmaFields = [] as any;
                        for (const field of fields) {
                            const create = new Date();

                            field["__createdAt"] = create.getTime();
                            field["__updatedAt"] = create.getTime();
                            if(field["tovarnyi_zapas_v_apteke_po_preparatu"]) {
                                field["tovarnyi_zapas_v_apteke_po_preparatu"] = field["tovarnyi_zapas_v_apteke_po_preparatu"].value;
                            }
                            field["id_vizita"] = vizit_id;
                            field["postponed"] = "1";

                            if(field["prikrepit_foto_vykladki"]) {
                                const newImages = [] as any;
                                for (const image of field["prikrepit_foto_vykladki"]) {
                                    const fileUri = MAIN_FOLDER + `/${elm_table}/${image.id}.jpg`;
                                    await FileSystem.moveAsync({from: image.uri, to: fileUri}).then(() => {
                                        image.uri = fileUri
                                        newImages.push(image);
                                    }).catch();
                                }
                                field["prikrepit_foto_vykladki"] = newImages;
                            }

                            const obj = {} as any;
                            const ex: string[] = [];
                            const arrValues: any = [];
                            const arrNames: string[] = [];
                            const arrExValues: string[] = [];
                            Object.keys(elm_fields).forEach((key) => {
                                const code = elm_fields[key].code;
                                const value = typeof field[code] === "object" ? JSON.stringify(field[code]) : field[code];
                                if(code === "__id") {
                                    arrValues.push(value ? String(value) : null);
                                } else {
                                    arrValues.push(value ? String(value) : "");
                                }
                                obj["elm_" + code] = value;
                                arrNames.push("elm_" + code);
                                ex.push('?');
                            });
                            arrExValues.push(`(${ex.join(',')})`);

                            if (arrValues.length > 0) {
                                const sql = `INSERT INTO ${elm_table}(${[...new Set(arrNames)].join(', ')}) VALUES ${arrExValues.join(',')};`;
                                await (await db).runAsync(sql, arrValues).then(async ({lastInsertRowId}) => {
                                    if (lastInsertRowId) {
                                        await (await db).runAsync(
                                            `UPDATE vizity SET elm_${field.bindings_code} = ? WHERE elm___id = ?;`,
                                            [String(lastInsertRowId), vizit_id]);

                                        elmaFields.push(true);
                                    }
                                });
                            }
                        }
                        resolve(elmaFields);
                    });

                    if(elmaFields.length > 0) {
                        resolve(true);
                    } else {
                        resolve(true);
                    }
                } else {
                    resolve(false);
                }
            }).catch(() => {
                resolve(false);
            });
        });
    };

    const getElmaKartinkiOprosnika = async (userId: string, vizit_id: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const post_data = JSON.stringify({userId: userId, vizit_id: vizit_id});
            const data: any[] = await axios.post(`${URL_MODEL_API}/get_kartinki_oprosnika`, post_data)
                .then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null;
                });

            if(data) {
                const chunkSize = 1000;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize) as any;
                    for (const item of chunk) {
                        if(item["prikrepit_foto_vykladki"].length > 0) {
                            const arrImages = [] as any;
                            for (const image of item["prikrepit_foto_vykladki"]) {
                                const fileUri = MAIN_FOLDER + `/${elm_table}/${Crypto.randomUUID()}.jpg`;
                                const file = await FileSystem.downloadAsync(image, fileUri);
                                if(file) {
                                    const resize = await ImageManipulator.manipulateAsync(file.uri);
                                    if(resize) {
                                        arrImages.push({
                                            id: Crypto.randomUUID(),
                                            uri: file.uri,
                                            width: resize.width,
                                            height: resize.height,
                                        });
                                    }
                                }
                            }

                            if(arrImages.length > 0) {
                                await (await db).runAsync(
                                    `UPDATE ${elm_table} SET elm_prikrepit_foto_vykladki = ? WHERE elm___id = ?;`,
                                    [JSON.stringify(arrImages), item.__id]);
                            }
                        }
                    }
                }
                resolve(true);
            } else {
                resolve(false);
            }
        });
    };

    return {addAppOprosnik, getOprosnikQuery, getElmaKartinkiOprosnika}
};

export default sqlOprosnik;