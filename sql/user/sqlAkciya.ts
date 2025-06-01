import {db} from "@/sql/db";
import axios from "axios";
import sqlSettings from "@/sql/user/sqlSettings";
import {IAppAkciya} from "@/types/Akciya";
import {URL_MODEL_API, MAIN_FOLDER} from "@/context/config";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";


const sqlAkciya = () => {
    const {getSettings} = sqlSettings();
    const elm_table = "akciya_na_pokupatelya";

    const getAkciyaQuery = async (select: string, query: string): Promise<{app_akciya: IAppAkciya[] | null, error: string | null}> => {
        return await new Promise(async (resolve) => {
            await (await db).getAllAsync(`SELECT ${select} FROM ${elm_table} WHERE 1=1 ${query}`)
                .then((result: any) => {
                    if (result.length > 0) {
                        resolve({app_akciya: result, error: null});
                    } else {
                        resolve({ app_akciya: null, error: null });
                    }
                }).catch((error) => {
                    resolve({ app_akciya: null, error: error.message });
                });
        });
    };

    const addAppAkciya = async (fields: any[], vizit_id: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            getSettings('*', `AND elm_table = "akciya"`).then(async ({app_settings}) => {
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
                            field["__createdAt"] = String(create.getTime());
                            field["__updatedAt"] = String(create.getTime());
                            field["id_vizita"] = vizit_id;
                            field["postponed"] = "1";

                            if(field["foto"]) {
                                const newImages = [] as any;
                                for (const image of field["foto"]) {
                                    const fileUri = MAIN_FOLDER + `/${elm_table}/${image.id}.jpg`;
                                    await FileSystem.moveAsync({from: image.uri, to: fileUri})
                                        .then(() => {
                                            image.uri = fileUri
                                            newImages.push(image);
                                        }).catch();
                                }
                                field["foto"] = newImages;
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
                                            [String(lastInsertRowId), vizit_id]).catch(() => true);
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
                }
            }).catch(() => {
                resolve(false);
            });
        });
    };

    const getElmaKartinkiAkciya = async (userId: string, vizit_id: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const post_data = JSON.stringify({userId: userId, vizit_id: vizit_id});
            const data: any[] = await axios.post(`${URL_MODEL_API}/get_kartinki_akcii`, post_data)
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
                        if(item["foto"]) {
                            const fileUri = MAIN_FOLDER + `/${elm_table}/${Crypto.randomUUID()}.jpg`;
                            const file = await FileSystem.downloadAsync(item["foto"], fileUri);
                            if(file) {
                                const resize = await ImageManipulator.manipulateAsync(file.uri);
                                if(resize) {
                                    const obj = {
                                        id: Crypto.randomUUID(),
                                        uri: file.uri,
                                        width: resize.width,
                                        height: resize.height,
                                    };

                                    await (await db).runAsync(
                                        `UPDATE ${elm_table} SET elm_foto = ? WHERE elm___id = ?;`,
                                        [JSON.stringify([obj]), item.__id]);
                                }
                            }
                        }
                    }
                }

                resolve(false);
            } else {
                resolve(false);
            }
        });
    };

    return {addAppAkciya, getAkciyaQuery, getElmaKartinkiAkciya}
};

export default sqlAkciya;