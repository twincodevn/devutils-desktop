import { useState, useEffect, useRef } from "react";

export function AnimNum({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef<number>(0);
    useEffect(() => {
        const start = display; const diff = value - start; const steps = 30; let step = 0;
        clearInterval(ref.current);
        ref.current = window.setInterval(() => {
            step++; setDisplay(Math.round((start + diff * (step / steps)) * 10) / 10);
            if (step >= steps) clearInterval(ref.current);
        }, 20);
        return () => clearInterval(ref.current);
    }, [value]);
    return <>{display}{suffix}</>;
}
