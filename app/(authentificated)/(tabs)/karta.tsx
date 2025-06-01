import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Text,
    SafeAreaView,
    StatusBar,
    Platform,
    Modal
} from "react-native";
import YaMap, { Marker } from "react-native-yamap";
import { Picker } from "@react-native-picker/picker";
import { db } from "@/sql/db";
import {URL_MODEL_API} from "@/context/config";
import {IAppVizityAdd} from "@/types/Vizity";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {useAuth} from "@/context/AuthContext";
import {IAppTochki} from "@/types/Tochki";

interface Point {
    id: number;
    elm_id:string;
    latitude: number;
    longitude: number;
    name: string;
    category: string;
    discount: string;
}

const fetchGeoPoints = async (): Promise<Point[]> => {
    try {
        const sql = "SELECT id, elm___id, elm_geokoordinaty, elm_adres_apteki, elm_kategoriya, elm_akciya FROM tochki;";
        const result = await (await db).getAllAsync(sql) as {
            id: number;
            elm___id:string
            elm_geokoordinaty: string;
            elm_adres_apteki: string;
            elm_kategoriya: string;
            elm_akciya: string;
        }[];

        return result.map((row) => {
            const [latitude, longitude] = row.elm_geokoordinaty.split(",").map(Number);
            return {
                id: row.id,
                elm_id: row.elm___id,
                latitude,
                longitude,
                name: row.elm_adres_apteki,
                category: row.elm_kategoriya,
                discount: row.elm_akciya
            };
        });
    } catch (error) {
        console.error("Ошибка при загрузке точек геолокации:", error);
        return [];
    }
};

const MapScreen = () => {
    const { app_user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showDiscountsOnly, setShowDiscountsOnly] = useState<boolean>(false);
    const [filteredPoints, setFilteredPoints] = useState<Point[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);

    useEffect(() => {
        const loadPoints = async () => {
            const data = await fetchGeoPoints();
            setPoints(data);
            setFilteredPoints(data);
        };
        loadPoints();
    }, []);

    useEffect(() => {
        let filtered = points;

        if (searchText.trim()) {
            filtered = filtered.filter(point =>
                point.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(point => point.category === selectedCategory);
        }

        if (showDiscountsOnly) {
            filtered = filtered.filter(point => point.discount);
        }

        setFilteredPoints(filtered);
    }, [searchText, selectedCategory, showDiscountsOnly, points]);

    const categories = Array.from(new Set(points.map(point => point.category)));

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Поиск по названию..."
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#A690C3"
                    />
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Все категории" value={null} />
                        {categories.map(category => (
                            <Picker.Item key={category} label={category} value={category} />
                        ))}
                    </Picker>

                    <TouchableOpacity
                        style={[styles.discountButton, showDiscountsOnly && styles.discountButtonActive]}
                        onPress={() => setShowDiscountsOnly(!showDiscountsOnly)}
                    >
                        <Text style={styles.discountButtonText}>
                            {showDiscountsOnly ? "Акции: ВКЛ" : "Акции: ВЫКЛ"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <YaMap style={styles.map} showUserPosition={true} initialRegion={{ lat: 55.751244, lon: 37.618423, zoom: 12 }}>
                {filteredPoints.map((point) => (
                    <Marker
                        key={point.elm_id}
                        point={{ lat: point.latitude, lon: point.longitude }}
                        scale={1.5}
                        onPress={() => {
                            setSelectedPoint(point);
                            setModalVisible(true);  // Добавляем, чтобы открыть модалку
                        }}
                    />
                ))}
            </YaMap>

            {selectedPoint && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Выберите дату и время</Text>

                            {selectedPoint && (
                                <Text>Аптека: {selectedPoint.name}</Text>
                            )}
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
                                        if (!selectedDate || !selectedPoint) {
                                            console.log("Ошибка: нет даты или аптеки");
                                            return;
                                        }

                                        const formattedTimestamp = String(selectedDate.getTime());

                                        const newVisit: IAppVizityAdd = {
                                            elm_tochka: selectedPoint.elm_id,
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
                                                        selectedPoint.elm_id,
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
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 13,
        paddingBottom: 8,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    dateButton: {
        backgroundColor: "#6A5ACD",
        padding: 10,
        borderRadius: 5,
        marginVertical: 10,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: "#7257ec",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
        color: "#7257ec",
    },
    picker: {
        height: 40,
        backgroundColor: "#E6E6FA",
        borderRadius: 20,
        marginBottom: 5, // Добавлено пятое пространство
    },
    discountButton: {
        marginTop: 8,
        backgroundColor: "#8871ef",
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 20,
        marginBottom: 12,
    },
    discountButtonActive: {
        backgroundColor: "#7257ec",
    },
    discountButtonText: {
        color: "#c6c3fb",
        fontWeight: "bold",
    },
    confirmButton: {
        backgroundColor: "#6A5ACD", // Фиолетовый
        padding: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    map: {
        flex: 1,
    },
    callout: {
        position: "absolute",
        bottom: 50,
        left: "10%",
        right: "10%",
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        elevation: 5,
        alignItems: "center",
    },
    calloutText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    closeButton: {
        marginTop: 8,
        backgroundColor: "#7257ec",
        padding: 8,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    modalTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 10,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default MapScreen;
