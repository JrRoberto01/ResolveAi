import { getUser, User } from "@/api/auth.api";
import { useCallback, useEffect, useState } from "react";

export function getUserData(){
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUser = useCallback(async () => {
        const u = await getUser();
        setUser(u);
    }, []);

    const initialLoad = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            loadUser();

        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar dados do usuário");
        } finally {
            setLoading(false);
        }
    }, [loadUser]);

    useEffect(() => {
        initialLoad();
    }, [initialLoad]);

    return{ user, loading, refreshing, error };
}