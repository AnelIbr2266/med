import * as FileSystem from "expo-file-system";
import * as Application from "expo-application";

export const URL_MODEL_API = "https://reddys-elma.datafabrika.ru/api/extensions/6d7123f6-02d3-4db6-9c8e-ad6d305187b4/script";

export const APP_DB = `df_${Application.nativeApplicationVersion}_${Application.nativeBuildVersion}`;
// export const URL_API = "http://elma.petrovax.ru";
export const URL_API = "https://reddys-elma.datafabrika.ru";
export const MAP_KEY = "c1fb2e65-cc2e-4eb7-a2cc-a98c95d51eb2";
export const MAIN_FOLDER = FileSystem.documentDirectory + "petrovax";


