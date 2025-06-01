export interface IOprosnik {
    id: number;
    __id: string;
    __name: string;
    __createdAt: string;
    __updatedAt: string;
    brand_sku: string;
    id_brand_gold: string;
    comp_group: string;
    tovarnyi_zapas_v_apteke_po_preparatu: string;
    propustit_snyatie_ostatkov_i_formirovanie_zakaza: string;
    zakaz: string;
    prichina_otsutstviya_preparata: string;
    prikrepit_foto_vykladki: string;
    formirovanie_zakaza: string;
    propustit_fotofiksaciyu: string;
    apt_id: string;
    as: string;
    municipalnyi_raion: string;
    adres_apteki:  string;
    kategoriya: string;
}

export interface IAppOprosnik {
    id: number;
    elm_id: number;
    elm___id: string;
    elm___name: string;
    elm___createdAt: string;
    elm___updatedAt: string;
    elm_brand_sku: string;
    elm_id_brand_gold: string;
    elm_comp_group: string;
    elm_tovarnyi_zapas_v_apteke_po_preparatu: string;
    elm_propustit_snyatie_ostatkov_i_formirovanie_zakaza: string;
    elm_zakaz: string;
    elm_prichina_otsutstviya_preparata: string;
    elm_prikrepit_foto_vykladki: string;
    elm_formirovanie_zakaza: string;
    elm_propustit_fotofiksaciyu: string;
    elm_apt_id: string;
    elm_as: string;
    elm_municipalnyi_raion: string;
    elm_adres_apteki:  string;
    elm_kategoriya: string;
}



export interface IOprosnikFields {
    code: string;
    name: string;
    value: string;
    bindings: [];
    bindings_code: string;
}


export interface IOprosnikItems {
    code: string;
    conditions: any
    name: string;
    variants: [];
}

export interface IOprosnikAddReturn {
    id: number;
    vizit_target_id: string;
    oprosnik_id: string;
    created_at: string;
    updated_at: string;
}


export const ItemsOprosnik = [
    {
        "name": "Товарный запас в аптеке по препарату", "code": "tovarnyi_zapas_v_apteke_po_preparatu",
        "conditions": [
            {
                "a": {
                    "kind": "context",
                    "value": "propustit_snyatie_ostatkov_i_formirovanie_zakaza"
                },
                "type": "ENUM",
                "inversion": false,
                "operation": {
                    "relation": "empty",
                    "inversion": false,
                    "caseInsensitive": false
                },
                "conjunction": false
            }
        ]
    },
    {
        "name": "Пропустить", "code": "propustit_snyatie_ostatkov_i_formirovanie_zakaza",
        "variants": [
            {
                "code": "1_ne_predostavlyayut_ostatki",
                "name": "1. Не предоставляют остатки",
                "checked": false
            },
            {
                "code": "2_u_farmacevta_net_vremeni",
                "name": "2. У фармацевта нет времени",
                "checked": false
            },
            {
                "code": "3_bolshaya_ochered_v_apteke",
                "name": "3. Большая очередь в аптеке",
                "checked": false
            },
            {
                "code": "4_zav_zapretila_obshatsya_s_farmacevtom",
                "name": "4. Зав. запретила общаться с фармацевтом",
                "checked": false
            },
            {
                "code": "5_zakaz_formiruet_tolko_co",
                "name": "5. Заказ формирует только ЦО",
                "checked": false
            },
            {
                "code": "6_lpr_otkazyvaetsya_delat_zakaz",
                "name": "6. ЛПР отказывается делать заказ",
                "checked": false
            },
            {
                "code": "7_dolgi_na_distrakh",
                "name": "7. Долги на дистрах",
                "checked": false
            }
        ],
        "conditions": [
            {
                "a": {
                    "kind": "context",
                    "value": "tovarnyi_zapas_v_apteke_po_preparatu"
                },
                "type": "FLOAT",
                "inversion": false,
                "operation": {
                    "relation": "empty",
                    "inversion": false,
                    "caseInsensitive": false
                },
                "conjunction": false
            }
        ]
    },
    {
        "name": "Заказ", "code": "zakaz",
        "variants": [
            {
                "code": "da",
                "name": "Да",
                "checked": false
            },
            {
                "code": "net",
                "name": "Нет",
                "checked": false
            }
        ],
        "conditions": [
            {
                "a": {
                    "kind": "context",
                    "value": "tovarnyi_zapas_v_apteke_po_preparatu"
                },
                "b": {
                    "kind": "manual",
                    "value": 0
                },
                "type": "FLOAT",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": false,
                    "caseInsensitive": false
                },
                "conjunction": false
            }
        ]
    },
    {
        "name": "Причина отсутствия препарата", "code": "prichina_otsutstviya_preparata",
        "variants": [
            {
                "code": "1_net_na_distributorakh",
                "name": "1. Нет на дистрибуторах",
                "checked": false
            },
            {
                "code": "2_otkaz_lpr_v_zakaze",
                "name": "2. Отказ ЛПР в заказе",
                "checked": false
            },
            {
                "code": "3_net_na_rc_seti",
                "name": "3. Нет на РЦ сети",
                "checked": false
            }
        ],
        "conditions": [
            {
                "a": {
                    "kind": "context",
                    "value": "zakaz"
                },
                "b": {
                    "kind": "manual",
                    "value": [
                        {
                            "code": "net",
                            "name": "Нет"
                        }
                    ]
                },
                "type": "ENUM",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": false,
                    "caseInsensitive": false
                },
                "conjunction": false
            }
        ]
    },
    {
        "name": "Прикрепить фото выкладки", "code": "prikrepit_foto_vykladki",
        "conditions": [
            {
                "a": {
                    "kind": "context",
                    "value": "tovarnyi_zapas_v_apteke_po_preparatu"
                },
                "b": {
                    "kind": "manual",
                    "value": 0
                },
                "type": "FLOAT",
                "inversion": false,
                "operation": {
                    "relation": "greater",
                    "inversion": false,
                    "caseInsensitive": false
                },
                "conjunction": false
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 12 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 6 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО Р-Р 6 МГ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №20"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ ФЛ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "propustit_snyatie_ostatkov_i_formirovanie_zakaza"
                },
                "type": "ENUM",
                "inversion": false,
                "operation": {
                    "relation": "empty",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": false
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 12 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 6 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО Р-Р 6 МГ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №20"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ ФЛ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            }
        ]
    },
    {
        "name": "Пропустить фотофиксацию", "code": "propustit_fotofiksaciyu",
        "variants": [
            {
                "code": "1_zapret_na_foto_v_apteke",
                "name": "1. Запрет на фото в аптеке",
                "checked": false
            },
            {
                "code": "2_format_apteki_ne_predpolagaet_vykladku",
                "name": "2. Формат аптеки не предполагает выкладку",
                "checked": false
            },
            {
                "code": "3_net_kategorii",
                "name": "3. Нет категории",
                "checked": false
            },
            {
                "code": "4_otkazalis_vystavlyat",
                "name": "4. Отказались выставлять",
                "checked": false
            },
            {
                "code": "5_ne_udalos_naiti_mesto",
                "name": "5. Не удалось найти место",
                "checked": false
            }
        ],
        "conditions": [
            {
                "a": {
                    "kind": "context",
                    "value": "tovarnyi_zapas_v_apteke_po_preparatu"
                },
                "b": {
                    "kind": "manual",
                    "value": 0
                },
                "type": "FLOAT",
                "inversion": false,
                "operation": {
                    "relation": "greater",
                    "inversion": false,
                    "caseInsensitive": false
                },
                "conjunction": false
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 12 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 6 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО Р-Р 6 МГ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №20"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ ФЛ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "propustit_snyatie_ostatkov_i_formirovanie_zakaza"
                },
                "type": "ENUM",
                "inversion": false,
                "operation": {
                    "relation": "empty",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": false
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 12 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО СУПП 6 МГ №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ПО Р-Р 6 МГ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №10"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ СУПП №20"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            },
            {
                "a": {
                    "kind": "context",
                    "value": "brand_sku"
                },
                "b": {
                    "kind": "manual",
                    "value": "ЛГ ФЛ №5"
                },
                "type": "STRING",
                "inversion": false,
                "operation": {
                    "relation": "equal",
                    "inversion": true,
                    "caseInsensitive": false
                },
                "conjunction": true
            }
        ]
    },
];