
export interface IStatus {
    name: string;
    code: string;
}
export const arrStatus: IStatus[] = [
    {name: "План", code: "plan"},
    {name: "Факт", code: "fakt"},
    {name: "Аптека закрыта", code: "apteka-zakryta"},
    {name: "Запретили находиться в аптеке", code: "zapretili-nakhoditsya-v-apteke"},
    {name: "Большая очередь в аптеке", code: "bolshaya-ochered-v-apteke"},
    {name: "Инвентаризация", code: "inventarizaciya"},
    {name: "Отказались общаться", code: "otkazalis-obshatsya"},
];