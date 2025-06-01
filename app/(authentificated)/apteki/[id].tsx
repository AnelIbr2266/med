import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Button, FlatList, Modal} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db } from "@/sql/db";
import { IAppTochki } from "@/types/Tochki";
import {IAkciya, IAppAkciya} from "@/types/Akciya";
import sqlAkciya from "@/sql/user/sqlAkciya";
import {IAppSettings} from "@/types/Settings";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {IAppVizityAdd} from "@/types/Vizity";
import {URL_MODEL_API} from "@/context/config";
import {useAuth} from "@/context/AuthContext";
import app from "react-native/template/App";
import useMigrations from "@/sql/user/sqlUserMigrations";
import YaMap, {Marker} from "react-native-yamap";
import dayjs from "dayjs";
import {convertDate} from "@/utils/DateUtils";



const tabs = [
    { key: 'info', title: 'Информация' },
    { key: 'promotions', title: 'Акции' },
    { key: 'matrices', title: 'Матрицы' },
    { key: 'map', title: 'На карте' },
    { key: 'visits', title: 'Визиты' },
];

const PromotionsTab = ({ pharmacy }: { pharmacy: IAppTochki | null }) => {
    const [promotions, setPromotions] = useState<IAppAkciya[]>([]);
    const [customPromotions, setCustomPromotions] = useState<{ code: string; name: string; value: string | number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<IAppSettings | null>(null);

    useEffect(() => {
        const fetchPharmacyDetails = async () => {
            if (!pharmacy?.id) return;

            setLoading(true);
            try {
                // Загружаем данные по аптеке
                const sql = "SELECT * FROM tochki WHERE id = ?;";
                const result: IAppTochki | null = await (await db).getFirstAsync(sql, [pharmacy.id]);

                if (!result) {
                    setError("Аптека не найдена");
                    return;
                }

                // Загружаем settings для "tochki"
                const settingsSql = 'SELECT * FROM settings WHERE elm_table = "tochki";';
                const settingsResult: IAppSettings[] = await (await db).getAllAsync(settingsSql);

                setSettings(settingsResult.length > 0 ? settingsResult[0] : null);
            } catch (err) {
                setError("Ошибка при получении данных");
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDetails();
    }, [pharmacy?.id]);


    useEffect(() => {
        const fetchPromotions = async () => {
            setLoading(true);

            try {
                const { getAkciyaQuery } = sqlAkciya();
                const result = await getAkciyaQuery("*", `AND elm_apt_id = ${pharmacy?.id}`);

                if (result.error) {
                    throw new Error(result.error);
                }

                setPromotions(result.app_akciya || []);

                // Если нет акций в БД, пробуем загрузить из settings
                if (!result.app_akciya?.length && settings) {
                    const fields = JSON.parse(settings.elm_fields);
                    const newTochka = { ...pharmacy } as any;
                    const arr = [] as any;

                    Object.keys(fields).forEach((key) => {
                        const item = fields[key];
                        if (
                            item.code.toLowerCase().includes("akciya_na_pokupatelya") ||
                            item.code.toLowerCase().includes("prochie_aktivnosti")
                        ) {
                            const code = `elm_${item.code}`;
                            if (newTochka[code]) {
                                arr.push({
                                    code: item.code,
                                    name: item.name,
                                    value: newTochka[code],
                                });
                            }
                        }
                    });

                    setCustomPromotions(arr);
                } else {
                    setCustomPromotions([]);
                }
            } catch (err: any) {
                setError(err.message || "Ошибка загрузки акций");
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, [pharmacy?.id, settings]);

    if (loading) return <Text>Загрузка акций...</Text>;
    if (error) return <Text style={{ color: "red" }}>Ошибка: {error}</Text>;
    if (!promotions.length && !customPromotions.length) return <Text>Акций нет</Text>;

    return (
        <ScrollView contentContainerStyle={styles.tabContainerContent}>
            {promotions.map((promo) => (
                <View key={promo.elm___id} style={styles.promoCard}>
                    <Text style={styles.promoTitle}>{promo.elm___name || "Без названия"}</Text>
                    <Text>{promo.elm_kommentarii || "Описание отсутствует"}</Text>
                </View>
            ))}

            {customPromotions.map((promo, index) => (
                <View key={`custom_${index}`} style={styles.promoCard}>
                    <Text style={styles.promoTitle}>{promo.name || "Без названия"}</Text>
                    <Text>{promo.value || "Описание отсутствует"}</Text>
                </View>
            ))}
        </ScrollView>
    );
};


const InfoTab = ({ pharmacy }: { pharmacy: IAppTochki | null }) => (
    <ScrollView contentContainerStyle={styles.tabContainerContent}>
        <Text>Сеть: {pharmacy?.elm_set || "Не указано"}</Text>
        <Text>Категория: {pharmacy?.elm_kategoriya || "Не указана"}</Text>
        <Text>Формы выкладки: {pharmacy?.elm_forma_vykladki || "Не указаны"}</Text>
        <Text>Муниципальный район: {pharmacy?.elm_municipalnyi_raion || "Не указан"}</Text>
        <Text>Адрес аптеки: {pharmacy?.elm_adres_apteki || "Не указан"}</Text>
        <Text>Юридическое лицо: {pharmacy?.elm_yuridicheskoe_lico || "Не указано"}</Text>
        <Text>ИНН: {pharmacy?.elm_inn || "Не указан"}</Text>
        <Text>Телефон: {pharmacy?.elm_telefon || "Не указан"}</Text>
    </ScrollView>
);


const MatricesTab = ({ pharmacy }: { pharmacy: IAppTochki | null }) => {
    const [matrices, setMatrices] = useState<{ code: string; name: string; value: string | number }[]>([]);
    const [settings, setSettings] = useState<IAppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPharmacyDetails = async () => {
            if (!pharmacy?.id) return;

            setLoading(true);
            try {
                // Загружаем данные по аптеке
                const sql = "SELECT * FROM tochki WHERE id = ?;";
                const result: IAppTochki | null = await (await db).getFirstAsync(sql, [pharmacy.id]);

                if (!result) {
                    setError("Аптека не найдена");
                    return;
                }

                // Загружаем settings для "tochki"
                const settingsSql = 'SELECT * FROM settings WHERE elm_table = "tochki";';
                const settingsResult: IAppSettings[] = await (await db).getAllAsync(settingsSql);

                setSettings(settingsResult.length > 0 ? settingsResult[0] : null);
            } catch (err) {
                setError("Ошибка при получении данных");
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDetails();
    }, [pharmacy?.id]);

    useEffect(() => {
        if (!settings) return;

        try {
            const fields = JSON.parse(settings.elm_fields);
            const newTochka = { ...pharmacy } as any;
            const arr: { code: string; name: string; value: string | number }[] = [];

            Object.keys(fields).forEach((key) => {
                if (String(fields[key].tooltip).trim() === "тип матрицы") {
                    const code = `elm_${fields[key].code}`;
                    if (newTochka[code]) {
                        arr.push({
                            code: fields[key].code,
                            name: fields[key].name,
                            value: newTochka[code],
                        });
                    }
                }
            });

            setMatrices(arr);
        } catch (error) {
            console.error("Ошибка обработки settings.elm_fields:", error);
        }
    }, [pharmacy, settings]);

    if (!matrices.length) return <Text>Матриц нет</Text>;

    return (
        <ScrollView contentContainerStyle={styles.tabContainerContent}>
            {matrices.map((matrix, index) => (
                <View key={`matrix_${index}`} style={styles.promoCard}>
                    <Text style={styles.promoTitle}>{matrix.name || "Без названия"}</Text>
                    <Text>{matrix.value || "Нет данных"}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const MapTab = ({ pharmacy }: { pharmacy: IAppTochki | null }) => {
    const mapRef = useRef<YaMap>(null);
    if (!pharmacy || !pharmacy.elm_geokoordinaty) {
        return null;
    }
    const [latitude, longitude] = pharmacy.elm_geokoordinaty
        .split(',')
        .map(coord => parseFloat(coord.trim()));

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setCenter({
                lat: latitude,
                lon: longitude,
                zoom: 15,
            });
        }
    }, [latitude, longitude]);

    return (
        <View style={styles.container}>
            <YaMap ref={mapRef} style={styles.map} showUserPosition>
                <Marker point={{ lat: latitude, lon: longitude }} scale={1.5} />
            </YaMap>
        </View>
    );
};

const VisitsTab = ({ pharmacy }: { pharmacy: IAppTochki | null }) => {
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<"all" | "completed" | "pending">("all");

    useEffect(() => {
        const fetchVisits = async () => {
            if (!pharmacy?.id) return;

            setLoading(true);
            try {
                const sql = "SELECT * FROM vizity WHERE elm_tochka = ?";
                const result = await (await db).getAllAsync(sql, [pharmacy.elm___id]);
                setVisits(result);
            } catch (err) {
                setError("Ошибка при загрузке визитов");
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [pharmacy?.id]);

    const filteredVisits = visits.filter((visit) => {
        if (selectedFilter === "completed") return visit.elm___status !== "План";
        if (selectedFilter === "pending") return visit.elm___status === "План";
        return true;
    });

    return (
        <View style={styles.container}>
            {/* Контейнер фильтров остается в любом случае */}
            <View style={styles.filterContainer}>
                {["all", "completed", "pending"].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterButton,
                            selectedFilter === filter && styles.activeButton,
                        ]}
                        onPress={() => setSelectedFilter(filter as any)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                selectedFilter === filter && styles.activeText,
                            ]}
                        >
                            {filter === "all" ? "Все" : filter === "completed" ? "Завершенные" : "Не завершенные"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <Text style={styles.loadingText}>Загрузка визитов...</Text>
            ) : error ? (
                <Text style={styles.errorText}>Ошибка: {error}</Text>
            ) : filteredVisits.length === 0 ? (
                <Text style={styles.noVisitsText}>Визитов нет</Text>
            ) : (
                <FlatList
                    data={filteredVisits}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <View style={styles.visitItem}>
                            <Text style={styles.visitText}>
                                {convertDate(item.elm_data_vremya)}
                            </Text>

                            <Text style={styles.visitText}>Статус: {item.elm___status}</Text>
                        </View>
                    )}
                    nestedScrollEnabled
                />
            )}
        </View>
    );
};


const TabContent = ({ activeTab, pharmacy}: { activeTab: string; pharmacy: IAppTochki | null; vizitId: string }) => {
    switch (activeTab) {
        case 'info':
            return <InfoTab pharmacy={pharmacy} />;
        case 'promotions':
            return <PromotionsTab pharmacy={pharmacy}/>;
        case 'matrices':
            return <MatricesTab pharmacy={pharmacy}/>;
        case 'map':
            return <MapTab pharmacy={pharmacy}/>;
        case 'visits':
            return <VisitsTab pharmacy={pharmacy} />;
        default:
            return null;
    }
};



const TochkiIndexPage = () => {
    const { app_user } = useAuth();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [pharmacy, setPharmacy] = useState<IAppTochki | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("info");
    const [isPressed, setIsPressed] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const {vizityMigrations } = useMigrations();


    useEffect(() => {
        const fetchPharmacyDetails = async () => {
            const sql = `SELECT * FROM tochki WHERE id = ?;`;
            try {
                const result: IAppTochki | null = await (await db).getFirstAsync(sql, [id]);
                setPharmacy(result);
            } catch (err) {
                setError("Ошибка при получении данных");
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDetails();
    }, [id]);

    if (loading) {
        return <Text>Загрузка...</Text>;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.pharmacyName}>{pharmacy?.elm_adres_apteki || "Аптека"}</Text>

            <FlatList
                horizontal
                data={tabs}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === item.key && styles.activeTab]}
                        onPress={() => setActiveTab(item.key)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === item.key && styles.activeTabText,
                            ]}
                        >
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
            />

            {/* Контент вкладок */}
            <View style={styles.contentContainer}>
                <TabContent activeTab={activeTab} pharmacy={pharmacy} vizitId={id} />
                <TouchableOpacity
                    style={[styles.tabButton, isPressed && styles.activeButton]}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                    onPress={() => setModalVisible(true)} // Открываем модалку
                    activeOpacity={0.6}
                >
                    <Text style={styles.tabText}>Добавить визит</Text>
                </TouchableOpacity>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Выберите дату и время</Text>

                            {/* Кнопка для вызова DateTimePicker */}
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setDatePickerVisible(true)}
                            >
                                <Text style={styles.buttonText}>
                                    {selectedDate
                                        ? selectedDate.toLocaleString("ru-RU", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "Выберите дату"}
                                </Text>
                            </TouchableOpacity>

                            {/* Компонент выбора даты и времени */}
                            <DateTimePickerModal
                                isVisible={datePickerVisible}
                                mode="datetime"
                                locale="ru_RU"
                                is24Hour={true}
                                onConfirm={(date) => {
                                    setSelectedDate(date);
                                    setDatePickerVisible(false);
                                    console.log("Выбрано:", date.toLocaleString("ru-RU"));
                                }}
                                onCancel={() => setDatePickerVisible(false)}
                            />

                            {/* Кнопки управления */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Отмена</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.confirmButton}
                                    onPress={async () => {
                                        if (!selectedDate || !pharmacy) {
                                            console.log("Ошибка: нет даты или аптеки");
                                            return;
                                        }

                                        const formattedTimestamp = String(selectedDate.getTime());

                                        const newVisit: IAppVizityAdd = {
                                            elm_tochka: pharmacy.elm___id,
                                            elm_data_vremya: formattedTimestamp,
                                            elm_postponed: "1",
                                        };

                                        try {
                                            if(app_user){
                                                const response = await fetch(`${URL_MODEL_API}/add_vizity`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    body: JSON.stringify({userId:app_user.userId, fields:newVisit}),
                                                });

                                                const result = await response.json();
                                                console.log("Ответ сервера:", result);

                                                if (response.ok) {
                                                    console.log("Визит успешно добавлен на сервер!");

                                                    // Проверяем, является ли result.data строкой и парсим в объект
                                                    const serverData = typeof result.data === "string" ? JSON.parse(result.data) : result.data;

                                                    // Преобразуем result в объект с корректными ключами
                                                    const transformedResult: Record<string, any> = {};
                                                    Object.entries(serverData[0]).forEach(([key, value]) => {
                                                        if (key !== "msg") {
                                                            const sanitizedKey = `elm_${key.replace(/[^a-zA-Z0-9_]/g, "_")}`; // Убираем недопустимые символы
                                                            transformedResult[sanitizedKey] = value;
                                                        }
                                                    });

                                                    // Создаём строку полей и плейсхолдеров
                                                    const fields = Object.keys(transformedResult).map(key => `"${key}"`).join(", "); // Ключи в кавычки
                                                    const placeholders = Object.keys(transformedResult).map(() => "?").join(", ");
                                                    const values = Object.values(transformedResult);

                                                    // Выполняем SQL-запрос
                                                    await (await db).runAsync(
                                                        `INSERT INTO vizity (${fields}) VALUES (${placeholders})`,
                                                        values
                                                    );

                                                    console.log("Запись успешно добавлена в локальную БД!");
                                                    setModalVisible(false);
                                                } else {
                                                    console.error(
                                                        "Ошибка при добавлении визита:",
                                                        result,
                                                        app_user.userId,
                                                        pharmacy.elm___id,
                                                        formattedTimestamp
                                                    );
                                                }

                                            } else {
                                                console.log("Ошибка: пользователя нет");
                                            }
                                        } catch (error) {
                                            console.error("Ошибка сети:", error);
                                        }
                                    }}
                                >
                                    <Text style={styles.buttonText}>Добавить</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

export default TochkiIndexPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    filterButton: {
        width: 120, // Уменьшаем ширину кнопок
        paddingVertical: 7,
        borderRadius: 15,
        alignItems: "center",
        marginHorizontal: 5,

    },
    activeButton: {
        backgroundColor: "#6A5ACD", // Глубокий фиолетовый
    },
    filterText: {
        color: "black",
        fontWeight: "bold",

    },
    activeText: {
        color: "white",
    },
    visitItem: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#f9f6fb", // Нежный фиолетовый
        marginBottom: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 2,  // Добавляем контур
        borderColor: "#6A5ACD",
    },
    visitText: {
        fontSize: 16,
    },
    loadingText: {
        textAlign: "center",
        fontSize: 18,
        marginTop: 20,
    },
    errorText: {
        textAlign: "center",
        fontSize: 18,
        color: "red",
        marginTop: 20,
    },
    noVisitsText: {
        textAlign: "center",
        fontSize: 18,
        marginTop: 20,
    },
    errorContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    tabContainerContent: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 10,
        borderWidth: 2,  // Добавляем контур
        borderColor: "#6A5ACD",
    },
    pharmacyName: {
        fontSize: 18,
        padding: 20,
        backgroundColor: "#dcdcfa",
        borderRadius: 12,
        textAlign: "center",
        marginBottom: 12,
        paddingTop: 50,
        borderWidth: 2,  // Добавляем контур
        borderColor: "#6A5ACD",
    },
    tabButton: {
        height: 35,
        paddingHorizontal: 12,
        marginHorizontal: 6,
        borderRadius: 12,
        minWidth: 90,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fbfbfb",
        borderWidth: 2,  // Добавляем контур
        borderColor: "#6A5ACD",
    },
    activeTab: {
        backgroundColor: "#7536c8",
    },
    tabText: {
        fontSize: 14,
        color: "#333",
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "bold",
    },
    contentContainer: {
        height: "83%",
        padding: 16,
    },
    tabContent: {
        fontSize: 16,
        paddingVertical: 2,
    },
    promoCard: {
        backgroundColor: "#fbfbfb",
        padding: 12,
        marginVertical: 6,
        borderRadius: 12,
        shadowColor: "#6A5ACD",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B0082",
        marginBottom: 4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)", // Затемнение фона
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    dateButton: {
        backgroundColor: "#6A5ACD",
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: "#fffdfd",
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: "#6A5ACD", // Фиолетовый
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    map: {
        flex: 1,
    },

});