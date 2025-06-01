import {useRouter} from "expo-router";
import {useAuth} from "@/context/AuthContext";
import React, {useEffect, useState} from "react";
import LoadingStart from "@/components/LoadingStart";

export default function Index() {
    const { session, isLoading, isUserMigration } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        if(!isLoading) {
            setTimeout(() => {
                if(session === "user") {
                    if(isUserMigration) {
                        return router.replace("/(authentificated)/(tabs)/main");
                    } else {
                        return router.replace("/(authentificated)/migration");
                    }
                } else {
                    return router.replace("/login");
                }
            }, 100);
        }
    }, []);

    if (loading) {
        return <LoadingStart />
    }
}
