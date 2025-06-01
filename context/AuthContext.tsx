import {
    useEffect,
    createContext,
    PropsWithChildren,
    useContext,
    useReducer,
    useCallback,
    useState
} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {URL_API, URL_MODEL_API} from "@/context/config";
import {decodeToken} from "react-jwt";
import {IAppUser, IUser} from "@/types/User";
import CryptoES from "crypto-es";
import NetInfo from '@react-native-community/netinfo';
import sqlUser from "@/sql/user/sqlUser";
import {db, deleteAllTables} from "@/sql/db";
import {IIsLocation} from "@/types/Location";
import * as Device from "expo-device";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
    initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
    return useReducer(
        (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
        initialValue
    ) as UseStateHook<T>;
}

async function setStorageItemAsync(key: string, value: string | null) {
    if (value === null) {
        await AsyncStorage.removeItem(key);
    } else {
        await AsyncStorage.setItem(key, value);
    }
}

function useStorageState(key: string): UseStateHook<string> {
    // Public
    const [state, setState] = useAsyncState<string>();

    // Get
    useEffect(() => {
        AsyncStorage.getItem(key).then(value => {
            setState(value);
        });
    }, [key]);

    // Set
    const setValue = useCallback(async (value: string | null) => {
        setState(value);
        await setStorageItemAsync(key, value);
    }, [key]);

    return [state, setValue];
}

const AuthContext = createContext<{
    logIn: (email: string, password: string) => Promise<any>;
    logInApp: (email: string, password: string) => Promise<any>;
    logOut: () => void;
    logOutUser: () => void;
    logOutClear: () => void;
    session?: string | null;
    isLoading: boolean;

    app_user: IAppUser | null;
    error?: string | null;
    getSetAppUser: (app_user: IAppUser) => void;
    isConnect: boolean;


    getSetIsLocation: (result: IIsLocation | null) => void;
    isLocation: IIsLocation | null;

    getSetIsVizityAdd: (result: any | null) => void;
    isVizityAdd: string | null;

    isUserMigration: boolean;
    getSetIsUserMigration: (result: boolean) => void;

    getSetIsInactivity: (result: any | null) => void;
    isInactivity: string | null;

    isTabled: boolean;
}>({
    logIn: async () => null,
    logInApp: async () => null,
    logOut: () => null,
    logOutUser: () => null,
    logOutClear: () => null,
    session: null,
    isLoading: false,

    app_user: null,
    error: null,
    getSetAppUser: () => null,
    isConnect: false,

    getSetIsLocation: () => null,
    isLocation: null,

    getSetIsVizityAdd: () => null,
    isVizityAdd: null,

    getSetIsUserMigration: () => null,
    isUserMigration: false,

    getSetIsInactivity: () => null,
    isInactivity: null,

    isTabled: false,
});


// This hook can be used to access the user info.
export function useAuth() {
    return useContext(AuthContext);
}

const error_message = 'Комбинация логин/пароль не верны';

const dropUserTable = async (): Promise<boolean> => {
    try {
        const sql = "DROP TABLE IF EXISTS user;";
        await (await db).execAsync(sql);
        console.log("🟢 Таблица 'user' успешно удалена.");
        return true;
    } catch (error) {
        console.error("🔴 Ошибка при удалении таблицы 'user':", error);
        return false;
    }
};

const createUserTable = async (): Promise<boolean>  => {
    return await new Promise(async (resolve) => {
        dropUserTable();
        await (await db).execAsync(`CREATE TABLE IF NOT EXISTS user (id integer primary key not null, userId text, name text, sub text, role text, secure text, group_user text, UNIQUE(userId));`)
            .then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
    })
};

const addUser = async (user: IUser): Promise<boolean>  => {
    return await new Promise(async (resolve) => {
        const arrArgs: any = []
        const arrExValues: any = []
        const ex = []
        for (const [key, value] of Object.entries(user)) {
            ex.push('?');
            arrArgs.push(value);
        }
        arrExValues.push(`(${ex.join(',')})`);
        if (arrArgs.length > 0) {
            const sql = `INSERT INTO user (userId, name, sub, role, secure, group_user) VALUES ${arrExValues.join(',')};`;
            await (await db).runAsync(sql, arrArgs).then(() => {
                resolve(true);
            }).catch((error) => {
                if (error.message.includes("UNIQUE")) {
                    console.warn("Пользователь с таким userId уже существует.");

                    return false;
                } else {
                    console.error("Ошибка при добавлении пользователя:", error);
                    resolve(false);

                }
            });
        }
    })
};




export function AuthProvider(props: PropsWithChildren) {
    const {getUser} = sqlUser();
    const [[isLoading, session], setSession] = useStorageState('session');

    const [error, setError] = useState<string | null>(null);
    const [app_user, setAppUser] = useState<IAppUser | null>(null);
    const [isConnect, setIsConnect] = useState<boolean>(false);

    const [isLocation, setIsLocation] = useState<IIsLocation | null>(null);
    const [isVizityAdd, setIsVizityAdd] = useState<string | null>(null);
    const [isInactivity, setIsInactivity] = useState<string | null>(null);

    const [isUserMigration, setIsUserMigration] = useState<boolean>(false);
    const [isTabled, setIsTabled] = useState<boolean>(Device.deviceType === 2);


    useEffect(() => {
        if(!session) return;

        (async () => {
            if(!app_user) {
                await AsyncStorage.getItem("user_info").then(async value => {
                    if(value) {
                        const data: IAppUser = JSON.parse(value);
                        getUser(data.userId).then(async ({app_user}) => {
                            if (app_user) {
                                setAppUser(app_user);
                            }
                        });
                    }
                });
            }
        })();
    }, [session]);



    useEffect(() => {
        return NetInfo.addEventListener((state: any) => {
            setIsConnect(state.isConnected);
        })
    }, [isConnect]);

    const getTableColumns = async (): Promise<void> => {
        const result = await (await db).getAllAsync("PRAGMA table_info(user);");
        console.log(result);
    };

    const value = {
        logIn: async (email: string, password: string) => {
            const user = await new Promise(async (resolve) => {
                if(email || password) {
                    await axios.post(`${URL_MODEL_API}/login`, {email: email, password: password})
                        .then(async (response) => {
                            console.log("🟢 Ответ от API:", response.data);
                            const data: any[] = JSON.parse(response.data.data);
                            if(data.length > 0) {
                                await axios.get(`${URL_API}/api/auth`, {
                                    headers: {
                                        "Cookie": "vtoken="+data[0].token
                                    }
                                }).then(async () => {
                                    const token = data[0].token;
                                    const decodedJwt: any = decodeToken(token);
                                    const encrypted = CryptoES.AES.encrypt("ok", password).toString();
                                    const userObj: any = {
                                        userId: decodedJwt.userId,
                                        name: decodedJwt.name,
                                        sub: decodedJwt.sub,
                                        role: decodedJwt.role,
                                        secure: encrypted,
                                        group: ""
                                    }

                                    await axios.post(`${URL_MODEL_API}/check_role`, {userId: decodedJwt.userId})
                                        .then(async (res) => {
                                            const data = JSON.parse(res.data.data);
                                            userObj["group"] = data.group;
                                            console.log("🟢 Группа пользователя:", userObj.group);

                                            const userTableCreate = await createUserTable();
                                            getTableColumns();
                                            if (!userTableCreate) {
                                                console.log("🔴 Ошибка: не удалось создать таблицу пользователя");
                                                resolve(false);
                                                return;
                                            }

                                            if(userTableCreate) {
                                                const userCreate = await addUser(userObj);
                                                if (!userCreate) {
                                                    console.log("🔴 Ошибка: не удалось добавить пользователя");
                                                    resolve(false);
                                                    return;
                                                }
                                                if(userCreate) {
                                                    await getUser(userObj.userId).then(async ({app_user}) => {
                                                        if(app_user) {
                                                            await AsyncStorage.setItem("user_info", JSON.stringify(userObj));
                                                            setAppUser(app_user);
                                                            setSession(data.group);
                                                            console.log("🟢 Пользователь авторизован, session установлена.");
                                                            resolve(true);
                                                        } else {
                                                            resolve(false);
                                                        }
                                                    });
                                                }
                                            }
                                        }).catch(() => {
                                            resolve(false);
                                        });
                                })
                            }
                            else console.log("🔴 Ошибка: пустой массив data");
                        }).catch((err) => {
                            console.log(err)
                            resolve(false);
                        });
                }
                resolve(false);
            });


            if(!user) {
                setError(error_message);
            }
        },
        logInApp: async (email: string, password: string) => {
            console.log("🟡 Начало логина...");

            const user = await new Promise(async (resolve) => {
                if (!email || !password) {
                    console.log("🔴 Ошибка: email или пароль отсутствуют");
                    resolve(false);
                    return;
                }

                console.log("🟢 Email и пароль переданы, проверяем данные...");

                await AsyncStorage.getItem("user_info").then(async value => {
                    if (!value) {
                        console.log("🔴 Ошибка: данные пользователя в AsyncStorage не найдены");
                        resolve(false);
                        return;
                    }

                    console.log("🟢 Найден пользователь в AsyncStorage:", value);

                    const data = JSON.parse(value);
                    console.log("📌 Полученные данные пользователя:", data);

                    getUser(data.userId).then(async ({ app_user }) => {
                        if (!app_user) {
                            console.log("🔴 Ошибка: пользователь не найден в БД");
                            resolve(false);
                            return;
                        }

                        console.log("🟢 Найден пользователь в БД:", app_user);

                        try {
                            console.log("🔑 Дешифруем пароль...");
                            const Decrypted = CryptoES.AES.decrypt(app_user["secure"], password);
                            const decode_result = Decrypted.toString(CryptoES.enc.Utf8);
                            if (decode_result === 'ok') {
                                await AsyncStorage.setItem("user_info", value);
                                setAppUser(app_user);
                                setSession(data.group);
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        } catch (err) {
                            console.log("🔴 Ошибка при расшифровке пароля:", err);
                            resolve(false);
                        }
                    }).catch(err => {
                        console.log("🔴 Ошибка при получении пользователя из БД:", err);
                        resolve(false);
                    });
                }).catch(err => {
                    console.log("🔴 Ошибка при получении user_info из AsyncStorage:", err);
                    resolve(false);
                });
            });

            if (!user) {
                console.log("🔴 Ошибка: логин не удался, вызываем setError");
                setError("Неверный логин или пароль");
            } else {
                console.log("✅ Пользователь успешно вошел в систему");
            }
        },

        logOut: async () => {
            setError(null);
            setSession(null);
        },
        logOutUser: async () => {
            setError(null);
            await AsyncStorage.removeItem("user_info");
            setAppUser(null);
            // await AsyncStorage.removeItem("migration_user");
            setSession(null);
        },
        logOutClear: async () => {
            setError(null);
            await AsyncStorage.removeItem("user_info");
            setAppUser(null);

            await AsyncStorage.removeItem("migration_user");

            setIsUserMigration(false);
            setIsLocation(null); // !!
            await deleteAllTables();
            setSession(null);
        },
        getSetAppUser: (app_user: IAppUser) => {
            setAppUser(app_user);
        },
        getSetIsVizityAdd: (result: any | null) => {
            setIsVizityAdd(result);
        },
        getSetIsLocation: (result: IIsLocation | null) => {
            setIsLocation(result);
        },
        getSetIsUserMigration: (result: boolean) => {
            setIsUserMigration(result);
        },
        getSetIsInactivity: (result: any | null) => {
            setIsInactivity(result);
        },

        session,
        isLoading,
        error,
        app_user,
        isConnect,
        isLocation,
        isVizityAdd,
        isUserMigration,
        isInactivity,
        isTabled,
    }

    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    );
}