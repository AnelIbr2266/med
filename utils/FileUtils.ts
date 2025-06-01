import * as FileSystem from "expo-file-system";
import {MAIN_FOLDER} from "@/context/config";

export const makeDirectory = async (name: string): Promise<boolean> => {
    return await new Promise(async (resolve) => {
        await FileSystem.makeDirectoryAsync(MAIN_FOLDER + "/" + name, { intermediates: true })
            .then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
    });
}
