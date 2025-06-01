import {createTable, db} from "@/sql/db";
import axios from "axios";
import {IUser} from "@/types/User";
import {IVizity} from "@/types/Vizity";
import {ITochki} from "@/types/Tochki";
import sqlSettings from "@/sql/user/sqlSettings";
import {IDeteilingKartinki} from "@/types/DeteilingKartinki";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import {makeDirectory} from "@/utils/FileUtils";
import {MAIN_FOLDER, URL_MODEL_API} from "@/context/config";
import {replaceNbsps} from "@/utils/FunctionsUtils";


interface IMigraciyaInner {
    "fields": {},
    "conditions": {},
}
interface IMigraciya {
    "vizity": IMigraciyaInner | null;
    "tochki": IMigraciyaInner | null;
    "oprosnik": IMigraciyaInner | null;
    "akciya": IMigraciyaInner | null;
}


const useMigrations = () => {
    const {getSettings} = sqlSettings()
    const settingsMigrations = async (user: IUser): Promise<boolean>  => {
        return await new Promise(async (resolve) => {

            const create = await createTable(
                `DROP TABLE IF EXISTS settings;`,
                `CREATE TABLE IF NOT EXISTS settings(id integer primary key not null, elm_table text, elm_fields text, elm_conditions text, UNIQUE(elm_table));`
            );

            if(create) {
                const data: IMigraciya = await axios.post(`${URL_MODEL_API}/migraciya`, {
                    userId: user.userId
                }).then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null
                });

                if (data) {
                    let arrValue: string[] = [];
                    for (const [elm_table, table] of Object.entries(data)) {
                        arrValue.push(`('${elm_table}', '${JSON.stringify(table.fields)}', '${JSON.stringify(table.conditions)}')`);
                    }

                    const sql = `INSERT INTO settings(elm_table, elm_fields, elm_conditions) VALUES ${arrValue.join(', ')};`;
                    await (await db).execAsync(sql).catch(() => true);
                }
            }
            resolve(true);
        });
    }
    const userMigrations = async (user: IUser): Promise<boolean>  => {
        return await new Promise(async (resolve) => {
            const create = await createTable(
                `DROP TABLE IF EXISTS user;`,
                `CREATE TABLE IF NOT EXISTS user(id integer primary key not null, userId text, name text, sub text, role text, secure text, UNIQUE(userId));`
            );

            if (create) {
                const arrArgs: any = []
                const arrExValues: any = []
                const ex = []
                for (const [key, value] of Object.entries(user)) {
                    ex.push('?');
                    arrArgs.push(value);
                }
                arrExValues.push(`(${ex.join(',')})`);
                if (arrArgs.length > 0) {
                    const sql = `INSERT INTO user (userId, name, sub, role, secure) VALUES ${arrExValues.join(',')};`;
                    await (await db).execAsync(sql).catch(() => true);
                }
            }
            resolve(true);
        });
    };

    const tochkiMigrations = async (userId: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elm_table = "tochki";
            const arrNames: string[] = [];
            const arrNamesCreate: string[] = [];

            const {app_settings} = await getSettings('*', `AND elm_table = "tochki"`);
            if(app_settings) {
                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                Object.assign(elm_fields, {300: {
                        "name": "Отложенные",
                        "code": "postponed"
                    }});

                Object.fromEntries(Object.entries(elm_fields).filter(([_, field]: any) => {
                    arrNamesCreate.push("elm_" + field.code + " text");
                    arrNames.push("elm_" + field.code);
                }));
            }

            const create = await createTable(
                `DROP TABLE IF EXISTS ${elm_table};`,
                `CREATE TABLE IF NOT EXISTS ${elm_table}(id integer primary key not null, 
                                                         ${arrNamesCreate.join(', ')}, UNIQUE(elm___id));`
            );

            if(create) {
                const data: ITochki[] = await axios.post(`${URL_MODEL_API}/fetch_tochki`, {
                    userId: userId,
                    from: 0,
                    size: 10000
                }).then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null;
                });

                if(data) {
                    const chunkSize = 1000;
                    for (let i = 0; i < data.length; i += chunkSize) {
                        const chunk = data.slice(i, i + chunkSize);

                        const arrValues: any = []
                        for (const item of chunk) {
                            Object.assign(item, {postponed: ""});

                            const arrArgs: string[] = []
                            for (const [key, value] of Object.entries(item)) {
                                const rvalue = replaceNbsps(value);
                                const rrvalue =  rvalue.replace("'", "''")
                                arrArgs.push("'"+rrvalue+"'");
                            }
                            arrValues.push(`(${arrArgs.join(',')})`);
                        }

                        if (arrNames.length > 0) {
                            const sql = `INSERT INTO ${elm_table} (${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                            await (await db).execAsync(sql).catch(() => false);
                        }
                    }
                }
            }
            resolve(true);
        });
    };

    const vizityMigrations = async (userId: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elm_table = "vizity";
            const arrNames: string[] = [];
            const arrNamesCreate: string[] = [];
            const {app_settings} = await getSettings('*', `AND elm_table = "${elm_table}"`);
            if(app_settings) {
                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                Object.assign(elm_fields, {300: {
                        "name": "Отложенные",
                        "code": "postponed"
                    }});

                Object.fromEntries(Object.entries(elm_fields).filter(([_, field]: any) => {
                    arrNamesCreate.push("elm_" + field.code + " text");
                    arrNames.push("elm_" + field.code);
                }));
            }

            const create = await createTable(
                `DROP TABLE IF EXISTS ${elm_table};`,
                `CREATE TABLE IF NOT EXISTS ${elm_table}(id integer primary key not null, ${arrNamesCreate.join(', ')}, UNIQUE(elm___id));`
            );

            if(create) {
                const data: IVizity[] = await axios.post(`${URL_MODEL_API}/fetch_vizity`, {
                    userId: userId,
                    from: 0,
                    size: 10000,
                    status_id: 1
                }).then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null;
                });


                if(data) {
                    const chunkSize = 1000;
                    for (let i = 0; i < data.length; i += chunkSize) {
                        const chunk = data.slice(i, i + chunkSize);

                        const arrValues: any = []
                        for (const item of chunk) {
                            Object.assign(item, {postponed: ""});

                            const arrArgs: string[] = []
                            for (const [key, value] of Object.entries(item)) {
                                arrArgs.push("'"+replaceNbsps(value)+"'");
                            }
                            arrValues.push(`(${arrArgs.join(',')})`);
                        }

                        if (arrNames.length > 0) {
                            const sql = `INSERT INTO ${elm_table}(${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                            await (await db).execAsync(sql).catch(() => false);
                        }
                    }
                }
            }
            resolve(true);
        });
    };

    const oprosnikMigrations = async (userId: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elm_table = "brand_sku_oprosnik";
            const arrNames: string[] = [];
            const arrNamesCreate: string[] = [];

            await makeDirectory(elm_table);

            const {app_settings} = await getSettings('*', `AND elm_table = "oprosnik"`);
            if(app_settings) {
                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                Object.assign(elm_fields, {
                    300: {
                        "name": "Отложенные",
                        "code": "postponed"
                    }
                });

                Object.fromEntries(Object.entries(elm_fields).filter(([_, field]: any) => {
                    arrNamesCreate.push("elm_" + field.code + " text");
                    arrNames.push("elm_" + field.code);
                }));

                const create = await createTable(
                    `DROP TABLE IF EXISTS ${elm_table};`,
                    `CREATE TABLE IF NOT EXISTS ${elm_table}(id integer primary key not null, ${arrNamesCreate.join(', ')}, UNIQUE(elm___id));`
                );

                if(create) {
                    const data: any[] = await axios.post(`${URL_MODEL_API}/fetch_oprosnik`, {
                        userId: userId,
                        from: 0,
                        size: 10000
                    }).then((response) => {
                        return JSON.parse(response.data.data);
                    }).catch(() => {
                        return null;
                    });

                    if(data) {
                        const chunkSize = 1000;
                        for (let i = 0; i < data.length; i += chunkSize) {
                            const chunk = data.slice(i, i + chunkSize);

                            const arrValues: any = []
                            for (const item of chunk) {
                                Object.assign(item, {postponed: ""});
                                const arrArgs: string[] = []
                                for (const [key, value] of Object.entries(item)) {
                                    arrArgs.push("'"+value+"'");
                                }
                                arrValues.push(`(${arrArgs.join(',')})`);
                            }

                            if (arrNames.length > 0) {
                                const sql = `INSERT INTO ${elm_table}(${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                                await (await db).execAsync(sql).catch(() => true);
                            }
                        }
                    }
                }
            }
            resolve(true);
        });
    };

    const akciyaMigrations = async (userId: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elm_table = "akciya_na_pokupatelya";
            const arrNames: string[] = [];
            const arrNamesCreate: string[] = [];

            await makeDirectory(elm_table);

            const {app_settings} = await getSettings('*', `AND elm_table = "akciya"`);
            if(app_settings) {
                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                Object.assign(elm_fields, {
                    300: {
                        "name": "Отложенные",
                        "code": "postponed"
                    }
                });

                Object.fromEntries(Object.entries(elm_fields).filter(([_, field]: any) => {
                    arrNamesCreate.push("elm_" + field.code + " text");
                    arrNames.push("elm_" + field.code);
                }));

                const create = await createTable(
                    `DROP TABLE IF EXISTS ${elm_table};`,
                    `CREATE TABLE IF NOT EXISTS ${elm_table}(id integer primary key not null, ${arrNamesCreate.join(', ')}, UNIQUE(elm___id));`
                );

                if(create) {
                    const data: any[] = await axios.post(`${URL_MODEL_API}/fetch_akciya`, {
                        userId: userId,
                        from: 0,
                        size: 10000
                    }).then((response) => {
                        return JSON.parse(response.data.data);
                    }).catch(() => {
                        return null;
                    });

                    if(data) {
                        const chunkSize = 1000;
                        for (let i = 0; i < data.length; i += chunkSize) {
                            const chunk = data.slice(i, i + chunkSize);

                            const arrValues: any = []
                            for (const item of chunk) {
                                Object.assign(item, {postponed: ""});
                                const arrArgs: string[] = []
                                for (const [key, value] of Object.entries(item)) {
                                    arrArgs.push("'"+value+"'");
                                }
                                arrValues.push(`(${arrArgs.join(',')})`);
                            }

                            if (arrNames.length > 0) {
                                const sql = `INSERT INTO ${elm_table}(${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                                await (await db).execAsync(sql).catch(() => false);
                            }
                        }
                    }
                }
            }
            resolve(true);
        });
    };


    const deteilingMigrations = async (userId: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elm_table = "deteiling";
            const arrNames: string[] = [];
            const arrNamesCreate: string[] = [];

            const {app_settings} = await getSettings('*', `AND elm_table = "deteiling"`);
            if(app_settings) {
                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                Object.assign(elm_fields, {
                    300: {
                        "name": "Отложенные",
                        "code": "postponed"
                    }
                });

                Object.fromEntries(Object.entries(elm_fields).filter(([_, field]: any) => {
                    arrNamesCreate.push("elm_" + field.code + " text");
                    arrNames.push("elm_" + field.code);
                }));

                const create = await createTable(
                    `DROP TABLE IF EXISTS ${elm_table};`,
                    `CREATE TABLE IF NOT EXISTS ${elm_table}(id integer primary key not null, ${arrNamesCreate.join(', ')}, UNIQUE(elm___id));`
                );

                if(create) {
                    const data: ITochki[] = await axios.post(`${URL_MODEL_API}/fetch_deteiling`, {
                        userId: userId,
                        from: 0,
                        size: 10000
                    }).then((response) => {
                        return JSON.parse(response.data.data);
                    }).catch(() => {
                        return null;
                    });

                    if(data) {
                        const chunkSize = 1000;
                        for (let i = 0; i < data.length; i += chunkSize) {
                            const chunk = data.slice(i, i + chunkSize);

                            const arrValues: any = []
                            for (const item of chunk) {
                                Object.assign(item, {postponed: ""});
                                const arrArgs: string[] = []
                                for (const [key, value] of Object.entries(item)) {
                                    arrArgs.push("'"+value+"'");
                                }
                                arrValues.push(`(${arrArgs.join(',')})`);
                            }

                            if (arrNames.length > 0) {
                                const sql = `INSERT INTO ${elm_table}(${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                                await (await db).execAsync(sql).catch(() => false);
                            }
                        }
                    }
                }
            }
            resolve(true);
        });
    };

    const deteilingKartinkiMigrations = async (userId: string): Promise<boolean> => {
        return await new Promise(async (resolve) => {
            const elm_table = "deteiling_kartinki";
            const arrNames: string[] = [];
            const arrNamesCreate: string[] = [];

            const {app_settings} = await getSettings('*', `AND elm_table = "${elm_table}"`);
            if(app_settings) {
                const elm_fields = JSON.parse(app_settings[0].elm_fields);
                Object.fromEntries(Object.entries(elm_fields).filter(([_, field]: any) => {
                    arrNamesCreate.push("elm_" + field.code + " text");
                    arrNames.push("elm_" + field.code);
                }));
            }

            const create = await createTable(
                `DROP TABLE IF EXISTS ${elm_table};`,
                `CREATE TABLE IF NOT EXISTS ${elm_table}(id integer primary key not null, ${arrNamesCreate.join(', ')}, UNIQUE(elm___id));`
            );

            if(create) {
                const data: IDeteilingKartinki[] = await axios.post(`${URL_MODEL_API}/fetch_deteiling_kartinki`, {
                    userId: userId,
                }).then((response) => {
                    return JSON.parse(response.data.data);
                }).catch(() => {
                    return null;
                });

                if(data) {
                    await makeDirectory(elm_table);

                    const chunkSize = 1000;
                    for (let i = 0; i < data.length; i += chunkSize) {
                        const chunk = data.slice(i, i + chunkSize);

                        const arrValues: any = []
                        for (const item of chunk) {
                            const arrArgs: string[] = [];
                            for (const [key, value] of Object.entries(item)) {
                                if(["__id", "__name", "__updatedAt", "__createdAt"].includes(key)) {
                                    arrArgs.push("'"+value+"'");
                                } else {
                                    if(value.length > 0) {
                                        const arrImages = [] as any;
                                        for (const image of value) {
                                            const fileUri = MAIN_FOLDER + `/${elm_table}/${Crypto.randomUUID()}.jpg`;
                                            const data = await FileSystem.downloadAsync(image, fileUri);
                                            if(data) {
                                                const resize = await ImageManipulator.manipulateAsync(data.uri);
                                                if(resize) {
                                                    arrImages.push({
                                                        id: Crypto.randomUUID(),
                                                        uri: data.uri,
                                                        width: resize.width,
                                                        height: resize.height,
                                                    });
                                                }
                                            }
                                        }
                                        arrArgs.push("'"+JSON.stringify(arrImages)+"'");
                                    } else {
                                        arrArgs.push("''");
                                    }
                                }
                            }
                            arrValues.push(`(${arrArgs.join(',')})`);
                        }

                        if (arrNames.length > 0) {
                            const sql = `INSERT INTO deteiling_kartinki (${arrNames.join(', ')}) VALUES ${arrValues.join(',')};`;
                            await (await db).execAsync(sql).catch(() => false);
                        }
                    }
                }
            }
            resolve(true);
        });
    };


    return {settingsMigrations, userMigrations, vizityMigrations, tochkiMigrations, oprosnikMigrations, akciyaMigrations, deteilingMigrations, deteilingKartinkiMigrations};
}

export default useMigrations;
