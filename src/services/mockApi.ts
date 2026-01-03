import type { ApiService } from './api';
import type { Client, Invoice, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

const LATENCY = 500; // Simulate network delay

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to handle 10-minute temporary persistence
const STORAGE_KEY_TIMESTAMP = 'data_timestamp';
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const checkAndResetStorage = () => {
    const timestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    const now = Date.now();

    // If no timestamp or expired, clear data
    if (!timestamp || (now - parseInt(timestamp)) > TTL_MS) {
        localStorage.removeItem('clients');
        localStorage.removeItem('invoices');
        localStorage.setItem(STORAGE_KEY_TIMESTAMP, now.toString()); // Start new window
        return true; // Reset happened
    }
    return false; // Valid session
};

// Initialize persistence check
checkAndResetStorage();

// Helpers for LS access
const getStorage = <T>(key: string): T[] => {
    // Check expiry before every read
    if (checkAndResetStorage()) return [];

    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
    // Update timestamp on write to extend session
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());
};


export const mockApi: ApiService = {
    auth: {
        login: async (email, password) => {
            await delay(LATENCY);
            if (email === 'demo@example.com' && password === 'password') {
                const user: User = {
                    id: 'user-1',
                    email,
                    name: 'Demo User',
                    businessName: 'My Freelance Biz',
                    themeColor: 'blue',
                };
                localStorage.setItem('session', JSON.stringify(user));
                return { user, session: 'mock-session-token' };
            }
            throw new Error('Invalid credentials');
        },
        register: async (email, _password, name) => {
            await delay(LATENCY);
            const user: User = {
                id: 'user-1',
                email,
                name,
                businessName: 'New Business',
                themeColor: 'blue',
            };
            localStorage.setItem('session', JSON.stringify(user));
            return { user, session: 'mock-session-token' };
        },
        logout: async () => {
            await delay(LATENCY);
            localStorage.removeItem('session');
        },
        getCurrentUser: async () => {
            await delay(LATENCY);
            const session = localStorage.getItem('session');
            return session ? JSON.parse(session) : null;
        },
    },
    clients: {
        list: async (userId) => {
            await delay(LATENCY);
            const all = getStorage<Client>('clients');
            return all.filter((c) => c.userId === userId);
        },
        create: async (data) => {
            await delay(LATENCY);
            const all = getStorage<Client>('clients');
            const newClient: Client = {
                ...data,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
            };
            setStorage('clients', [...all, newClient]);
            return newClient;
        },
        update: async (id, data) => {
            await delay(LATENCY);
            const all = getStorage<Client>('clients');
            const index = all.findIndex((c) => c.id === id);
            if (index === -1) throw new Error('Client not found');
            const updated = { ...all[index], ...data };
            all[index] = updated;
            setStorage('clients', all);
            return updated;
        },
        delete: async (id) => {
            await delay(LATENCY);
            const all = getStorage<Client>('clients');
            setStorage('clients', all.filter((c) => c.id !== id));
        },
    },
    invoices: {
        list: async (userId) => {
            await delay(LATENCY);
            const all = getStorage<Invoice>('invoices');
            return all.filter((i) => i.userId === userId);
        },
        get: async (id) => {
            await delay(LATENCY);
            const all = getStorage<Invoice>('invoices');
            return all.find((i) => i.id === id) || null;
        },
        create: async (data) => {
            await delay(LATENCY);
            const all = getStorage<Invoice>('invoices');
            const newInvoice: Invoice = {
                ...data,
                id: uuidv4(),
            };
            setStorage('invoices', [...all, newInvoice]);
            return newInvoice;
        },
        update: async (id, data) => {
            await delay(LATENCY);
            const all = getStorage<Invoice>('invoices');
            const index = all.findIndex((i) => i.id === id);
            if (index === -1) throw new Error('Invoice not found');
            const updated = { ...all[index], ...data };
            all[index] = updated;
            setStorage('invoices', all);
            return updated;
        },
        delete: async (id) => {
            await delay(LATENCY);
            const all = getStorage<Invoice>('invoices');
            setStorage('invoices', all.filter((i) => i.id !== id));
        },
    },
};
