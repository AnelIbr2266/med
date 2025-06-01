import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { IAppVizity } from "@/types/Vizity";
import { router } from "expo-router";
import sqlVizity from "@/sql/user/sqlVizity";

// Хук загрузки визитов с пагинацией и фильтрацией
const useVizityAll = () => {
    const { getVizityQuery } = sqlVizity();

    const [vizityAll, setItemsAll] = useState<IAppVizity[]>([]);
    const [vizityCompleted, setItemsCompleted] = useState<IAppVizity[]>([]);
    const [vizityNotCompleted, setItemsNotCompleted] = useState<IAppVizity[]>([]);
    const [errorVizity, setError] = useState<string | null>(null);
    const [query, setQuery] = useState<string>("");
    const [switched, setSwitched] = useState<string>("all");
    const [refresh, setRefresh] = useState<boolean>(false);
    const size = 15;
    const select = `id, elm___name, elm___status, elm_data_vremya, elm_postponed, elm_kommentarii`;

    useEffect(() => {
        const sql = `${query} LIMIT 0, ${size}`;
        getVizityQuery(select, sql).then(({ app_vizity, error }) => {
            if (switched === "all") {
                setItemsAll(app_vizity ?? []);
            } else if (switched === "completed") {
                setItemsCompleted(app_vizity ?? []);
            } else if (switched === "not_completed") {
                setItemsNotCompleted(app_vizity ?? []);
            }
            setError(error);
        });
    }, [query]);

    function onEndReached() {
        let sql = "";
        if (switched === "all") {
            sql = `${query} LIMIT ${vizityAll.length}, ${size}`;
        } else if (switched === "completed") {
            sql = `${query} LIMIT ${vizityCompleted.length}, ${size}`;
        } else if (switched === "not_completed") {
            sql = `${query} LIMIT ${vizityNotCompleted.length}, ${size}`;
        }

        getVizityQuery(select, sql).then(({ app_vizity, error }) => {
            if (app_vizity) {
                if (switched === "all") {
                    setItemsAll(prev => [...prev, ...app_vizity]);
                } else if (switched === "completed") {
                    setItemsCompleted(prev => [...prev, ...app_vizity]);
                } else if (switched === "not_completed") {
                    setItemsNotCompleted(prev => [...prev, ...app_vizity]);
                }
            } else {
                setError(error);
            }
        });
    }

    function onRefresh() {
        setRefresh(true);
        const sql = `${query} LIMIT 0, ${size}`;
        getVizityQuery(select, sql).then(({ app_vizity, error }) => {
            if (switched === "all") {
                setItemsAll(app_vizity ?? []);
            } else if (switched === "completed") {
                setItemsCompleted(app_vizity ?? []);
            } else if (switched === "not_completed") {
                setItemsNotCompleted(app_vizity ?? []);
            }
            setError(error);
            setRefresh(false);
        });
    }

    function filterQuery(switched: string, query: string) {
        setSwitched(switched);
        setQuery(query);
    }

    return {
        vizityAll,
        vizityCompleted,
        vizityNotCompleted,
        errorVizity,
        onEndReached,
        onRefresh,
        refresh,
        filterQuery,
        switched,
    };
};

// Компонент
const Vizity = () => {
    const {
        vizityAll,
        vizityCompleted,
        vizityNotCompleted,
        errorVizity,
        onEndReached,
        onRefresh,
        refresh,
        filterQuery,
        switched,
    } = useVizityAll();

    const [activeFilter, setActiveFilter] = useState<"all" | "План" | "Завершенные">("all");

    const handleFilterChange = (filter: "all" | "План" | "Завершенные") => {
        setActiveFilter(filter);
        if (filter === "all") {
            filterQuery("all", "");
        } else if (filter === "План") {
            filterQuery("not_completed", `AND elm___status = "План"`);
        } else if (filter === "Завершенные") {
            filterQuery("completed", `AND elm___status != "План"`);
        }
    };

    const handleVisitPress = (id: number, status: string) => {
        if (status === "Факт") {
            router.push(`/(vizity)/completed/${id}`);
        } else {
            router.push(`/(vizity)/not_completed/${id}`);
        }
    };


    const getCurrentList = () => {
        if (switched === "all") return vizityAll;
        if (switched === "completed") return vizityCompleted;
        if (switched === "not_completed") return vizityNotCompleted;
        return [];
    };

    const renderItem = ({ item }: { item: IAppVizity }) => (
        <TouchableOpacity onPress={() => handleVisitPress(item.id, item.elm___status)}>
            <View style={styles.visitCard}>
                <Text style={styles.visitName}>{item.elm___name}</Text>
                <Text style={styles.visitStatus}>{item.elm___status}</Text>
            </View>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Список визитов</Text>
            <View style={styles.filterContainer}>
                {["all", "План", "Завершенные"].map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterButton, activeFilter === filter && styles.activeButton]}
                        onPress={() => handleFilterChange(filter as "all" | "План" | "Завершенные")}
                    >
                        <Text style={[styles.filterText, activeFilter === filter && styles.activeText]}>
                            {filter === "all" ? "Все" : filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {errorVizity ? (
                <Text style={styles.errorText}>{errorVizity}</Text>
            ) : getCurrentList().length === 0 ? (
                <Text style={styles.noVisitsText}>Нет визитов</Text>
            ) : (
                <FlatList
                    data={getCurrentList()}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={refresh}
                    onRefresh={onRefresh}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                />
            )}
        </SafeAreaView>
    );
};

export default Vizity;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F8FF",
        padding: 16,
        paddingTop: 50,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        color: "#4B0082",
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: "#D8BFD8",
        borderRadius: 10,
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: "#6A5ACD",
    },
    filterText: {
        color: "black",
        fontWeight: "bold",
    },
    activeText: {
        color: "white",
    },
    list: {
        paddingBottom: 20,
    },
    visitCard: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#E6E6FA",
        marginBottom: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    visitName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4B0082",
    },
    visitStatus: {
        fontSize: 14,
        color: "#333",
        marginTop: 4,
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
});
