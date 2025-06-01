import {useAuth} from "@/context/AuthContext";
import {useEffect, useRef} from "react";
import {AppState} from "react-native";

export const InactivityContext = ({children}: any) => {
    const {getSetIsInactivity} = useAuth();
    const appState = useRef(AppState.currentState);

    useEffect(() => {
       const subscription = AppState.addEventListener('change', async nextAppState => {
           if(nextAppState === "active" && appState.current.match(/background/)) {
               getSetIsInactivity(Date.now());
           }
           appState.current = nextAppState;
        });
        return () => {
            subscription.remove();
        };
    }, []);

    return children;
}