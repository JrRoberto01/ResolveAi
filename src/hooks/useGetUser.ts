import { getUser, User } from "@/api/auth.api";
import { useCallback, useEffect, useState } from "react";

export function useGetUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUser = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const userData = await getUser();
            setUser(userData);
        } catch (err: any) {
            setError(err?.message ?? "Erro ao carregar dados do usuario");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    return {
        user,
        loading,
        error,
        reloadUser: loadUser,
    };
}
