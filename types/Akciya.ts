
export interface IAkciya {
    __id: string;
    __name: string;
    __createdAt: string;
    __updatedAt: string;
    adres_apteki: string;
    akciya_mekhanizm: string;
    aktivaciya: string;
    apt_id: string;
    as: string;
    brend: string;
    foto: string;
    id_vizita: string;
    kategoriya: string;
    kommentarii: string;
    municipalnyi_raion: string;
    posid: string;
    prichina: string;
    rol_posid: string;
    status: string;
}

export interface IAppAkciya {
    id: number;
    elm_id: number;
    elm___id: string;
    elm___name: string;
    elm___createdAt: string;
    elm___updatedAt: string;
    elm_akciya_mekhanizm: string;
    elm_aktivaciya: string;
    elm_brend: string;
    elm_foto: string;
    elm_kommentarii: string;
    elm_postponed: string;
    elm_prichina: string;
    elm_status: string;
    elm_vizit_id: string;
    elm_apt_id: string;
    elm_as: string;
    elm_municipalnyi_raion: string;
    elm_adres_apteki:  string;
    elm_kategoriya: string;
}

export interface IAkciyaFields {
    code: string;
    name: string;
    value: string;
    bindings_code: string;
}

export interface IAkciyaItems {
    code: string;
    conditions: any
    name: string;
    variants: [];
}

export interface IAkciyaAddReturn {
    'id': number;
    'vizit_target_id': string;
    'akciya_id': string;
    'created_at': string;
    'updated_at': string;
}

export const ItemsAkciya = [
    {
        "name": "Статус", "code": "status",
        "variants": [
            {"code": "prokhodit", "name": "Проходит"},
            {"code": "ne_prokhodit", "name": "Не проходит"}
        ],
        "conditions": []
    },
    {
        "name": "Активация", "code": "aktivaciya",
        "variants": [
            {"code": "aktiviroval", "name": "Активировал"},
            {"code": "ne_aktiviroval", "name": "Не активировал  (выбрать причину):"}
        ],
        "conditions": [
            {
                "a": {"kind": "context", "value": "status"},
                "b": {"kind": "manual", "value": [{"code": "ne_prokhodit", "name": "Не проходит"}]},
                "type": "ENUM",
            }
        ]
    },
    {
        "name": "Фото", "code": "foto",
        "conditions": [
            {
                "a": {"kind": "context", "value": "status"},
                "b": {"kind": "manual", "value": [{"code": "prokhodit", "name": "Проходит"}]},
            },
            {
                "a": {"kind": "context", "value": "aktivaciya"},
                "b": {"kind": "manual", "value": [{"code": "aktiviroval", "name": "Активировал"}]},
            }
        ]
    },
    {
        "name": "Причина", "code": "prichina",
        "variants": [
            {"code": "1_tovara_net_v_nalichii", "name": "1. Товара нет в наличии"},
            {"code": "2_apteka_otkazyvaetsya_provodit_akciyu", "name": "2. Аптека отказывается проводить акцию"},
            {"code": "3_net_informacii_iz_co", "name": "3. Нет информации в аптеке из ЦО"},
            {"code": "4_net_mesta_na_vykladke", "name": "4. Нет места на выкладке"},
            {"code": "5_net_informacii_dlya_pokupatelya_vizualizaciya_i", "name": "5. Нет информации для покупателя (визуализация и"}
        ],
        "conditions": [
            {
                "a": {"kind": "context", "value": "aktivaciya"},
                "b": {"kind": "manual", "value": [{"code": "ne_aktiviroval", "name": "Не активировал  (выбрать причину):"}]},
            },
            {
                "a": {"kind": "context", "value": "status"},
                "b": {"kind": "manual", "value": [{"code": "prokhodit", "name": "Проходит"}]},
            }
        ]
    },
]
