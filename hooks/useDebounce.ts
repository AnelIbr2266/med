import {useCallback, useRef} from "react";

export function useDebounce(callback: any, delay: number) {
    const timer = useRef<any>(null)

    return useCallback((...args: any) => {
        if (timer.current) {
            clearTimeout(timer.current)
        }

        timer.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay]);
}