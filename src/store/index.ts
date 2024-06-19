import { create } from 'zustand';

interface UserState {
    token: string | null,
    setToken: (token: string) => void,
    removeToken: () => void,
    id: string | null,
    setId: (id: string) => void,
    removeId: () => void,
}

const getLocalStorage = (key: string): string => JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorage = (key: string, value: string | null) => window.localStorage.setItem(key, JSON.stringify(value));
const removeLocalStorage = (key: string) => { window.localStorage.removeItem(key); };

const useStore = create<UserState>((set) => ({
    token: getLocalStorage('token') || null,
    setToken: (token: string) => set(() => {
        setLocalStorage('token', token)
        return { token: token }
    }),
    removeToken: () => set((state) => {
        removeLocalStorage('token');
        return { token: null }
    }),
    id: getLocalStorage('id')  || null,
    setId: (id: string) => set(() => {
        setLocalStorage('id', id)
        return { id: id }
    }),
    removeId: () => set((state) => {
        removeLocalStorage('id');
        return { id: null }
    })
}))

export const useUserStore = useStore;