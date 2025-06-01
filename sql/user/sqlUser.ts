import {db} from "@/sql/db";
import {IAppUser} from "@/types/User";

const sqlUser = () => {
    const getUser = async (userId: string): Promise<{ app_user: IAppUser | null;}> => {
        const result: IAppUser | null = await new Promise(async (resolve) => {
            await (await db).getFirstAsync(`SELECT * FROM user WHERE userId = ?`, [userId])
                .then((res) => {
                    if(res) {
                        resolve(res as IAppUser);
                    } else {
                        resolve(null);
                    }
                }).catch(() => {
                    resolve(null);
                });
        });
        return { app_user: result };
    };

    return {getUser}
};

export default sqlUser;