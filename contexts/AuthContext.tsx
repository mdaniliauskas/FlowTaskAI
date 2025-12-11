"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
    user: string | null;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("flowtask_user");
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const login = (email: string) => {
        localStorage.setItem("flowtask_user", email);
        setUser(email);
    };

    const logout = () => {
        localStorage.removeItem("flowtask_user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
