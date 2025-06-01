export interface IAppDeteiling {
    id: number;
    elm_id: number;
    elm___id: string;
    elm___name: string;
    elm___createdAt: string;
    elm___updatedAt: string;
    elm_postponed: string;
    elm_prichina: string;
    elm_vizit_id: string;
    elm_apt_id: string;
    elm_municipalnyi_raion: string;
    elm_adres_apteki:  string;
    elm_kategoriya: string;
    elm___status: string;
    elm_artneo_kaps_30: string;
    elm_deteiling: string;
    elm_df_kapli_15_ml: string;
    elm_im_krem_30_g: string;
    elm_omegika_kaps_30: string;
    elm_po_tab_12_mg_10: string;
    elm_set: string;
    elm_uronekst_sashe_7: string;
    elm_uronekst_sashe_14: string;
    elm_velson_tab_30: string;
    elm_vitaferr_ekspress: string;
    elm_vitaferr_kaps_30: string;
}

export interface IDeteiling {
    __id: string;
    __name: string;
    __createdAt: string;
    __updatedAt: string;
    __status: string;
    apt_id: string;
    municipalnyi_raion: string;
    adres_apteki: string;
    kategoriya: string;
    set: string;
    deteiling: string;
    prichina: string;
    uronekst_sashe_7: string;
    po_tab_12_mg_10: string;
    artneo_kaps_30: string;
    velson_tab_30: string;
    vitaferr_kaps_30: string;
    df_kapli_15_ml: string;
    omegika_kaps_30: string;
    im_krem_30_g: string;
    vitaferr_ekspress: string;
    uronekst_sashe_14: string;
    polioksidonii: string;
    vizity: string;
    prezentaciya_uronekst: string;
}


export interface IDeteilingFields {
    code: string;
    name: string;
    images: [];
}

export interface IDeteilingSelect {
    deteiling: boolean;
    prichina: {};
}

export interface IDeteilingAddReturn {
    id: number;
    deteiling_id: string;
    created_at: string;
    updated_at: string;
}


export const ItemsDeteiling = [
    {
        "name": "Причина", "code": "prichina",
        "variants": [
            {"code": "zapret_na_provedenie_deteilinga", "name": "1. Запрет на проведение детейлинга"},
            {"code": "zagruzhennost_farmacevta", "name": "2. Загруженность фармацевта"},
            {"code": "znayut_vse_brendy", "name": "3. Знают все бренды"}
        ],
        "conditions": [
            {
                "a": {"kind": "context", "value": "deteiling"},
                "b": {"kind": "manual", "value": false},
            }
        ]
    },
];