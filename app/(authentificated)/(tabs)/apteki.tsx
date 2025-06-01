import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { IAppTochki } from "@/types/Tochki";
import { db } from "@/sql/db";
import {router} from "expo-router";

const fetchTochki = async (): Promise<IAppTochki[]> => {
    const sql = "SELECT id, elm_adres_apteki, elm_kategoriya, elm_akciya FROM tochki ORDER BY id;";
    const result = await (await db).getAllAsync(sql);
    return result as IAppTochki[];
};
interface Table {
    name: string;
}

const fetchAllTables = async (): Promise<string[]> => {
    const sql = "SELECT name FROM sqlite_master WHERE type ='table';";
    const result = await (await db).getAllAsync<Table>(sql); // Указываем обобщенный тип
    return result.map(item => item.name); // Теперь TS знает, что item имеет тип Table
};


const fetchCategories = async (): Promise<{ label: string, value: string }[]> => {
    const sql = "SELECT DISTINCT elm_kategoriya AS kategoriya FROM tochki ORDER BY kategoriya;";
    const result = await (await db).getAllAsync(sql);
    return (result as Array<{ kategoriya: string }>).map(item => ({
        label: item.kategoriya,
        value: item.kategoriya,
    }));
};

const TochkiList: React.FC = () => {
    const [tochki, setTochki] = useState<IAppTochki[]>([]);
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showPromotions, setShowPromotions] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {

        const listTables = async () => {
            try {
                const tables = await fetchAllTables();
                console.log("Список таблиц:", tables);
            } catch (err) {
                console.error("Ошибка при получении списка таблиц:", err);
            }
        };


        listTables();

        const getTochkiAndCategories = async () => {
            try {
                const data = await fetchTochki();
                setTochki(data);

                const catData = await fetchCategories();
                setCategories([{ label: 'Все категории', value: 'all' }, ...catData]);
            } catch (err) {
                setError("Ошибка при получении данных");
                console.error("Ошибка при получении данных:", err);
            } finally {
                setLoading(false);
            }
        };

        getTochkiAndCategories();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6044e4" />
                <Text style={styles.loadingText}>Загрузка...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const filteredTochki = tochki.filter(item => {
        const categoryMatch = selectedCategory === 'all' || item.elm_kategoriya === selectedCategory;
        const promotionMatch = !showPromotions || item.elm_akciya;
        const searchMatch = item.elm_adres_apteki?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        return categoryMatch && promotionMatch && searchMatch;
    });

    const renderItem = ({ item }: { item: IAppTochki }) => (
        <TouchableOpacity style={styles.itemContainer } onPress={() => router.push(`/apteki/${item.id}`)}>
            <Text style={styles.bold}>Адрес:</Text>
            <Text>{item.elm_adres_apteki || "Не указан адрес"}</Text>
            <Text style={styles.bold}>Категория:</Text>
            <Text style={styles.category}>{item.elm_kategoriya || "Не указана категория"}</Text>
            {item.elm_akciya && <Text style={styles.promotion}>Акция!</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={styles.screen}>
            <Text style={styles.header}>Список точек</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Поиск по адресу..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <View style={styles.filterContainer}>
                {/* Пикер для выбора категории */}
                <Text style={styles.pickerLabel}>Категория:</Text>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={styles.picker}
                >
                    {categories.map((category) => (
                        <Picker.Item key={category.value} label={category.label} value={category.value} />
                    ))}
                </Picker>

                <TouchableOpacity onPress={() => setShowPromotions(!showPromotions)} style={styles.promotionToggleContainer}>
                    <Text style={styles.promotionToggle}>
                        {showPromotions ? "Скрыть акции" : "Показать акции"}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredTochki}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginRight: 10,
    },
    picker: {
        flex: 1,
        height: 50,
        borderColor: '#6044e4',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: "#F8F8FF",
        color: '#000',  // Цвет текста в пикере
        paddingVertical:5
    },
    promotionToggleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    promotionToggle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6044e4',
        textDecorationLine: 'underline',
    },
    screen: {
        paddingTop: 50,
        flex: 1,
        padding: 16,
        backgroundColor: "#F8F8FF",
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#000000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#000000',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        margin: 20,
    },
    itemContainer: {
        marginBottom: 20,
        paddingBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        elevation: 2,
    },
    bold: {
        fontWeight: 'bold',
        color: '#000000',
    },
    category: {
        fontWeight: 'bold',
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#6044e4',
        padding: 5,
        borderRadius: 4,
    },
    promotion: {
        color: 'green',
        fontWeight: 'bold',
        marginTop: 5,
    },
    list: {
        paddingBottom: 20,
    },
    searchInput: {
        height: 40,
        borderColor: '#6044e4',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
});

export default TochkiList;