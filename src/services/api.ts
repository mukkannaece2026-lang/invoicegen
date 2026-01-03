import type { Client, Invoice, User } from '../types';

export interface ApiService {
    auth: {
        login: (email: string, password: string) => Promise<{ user: User; session: string }>;
        register: (email: string, password: string, name: string) => Promise<{ user: User; session: string }>;
        logout: () => Promise<void>;
        getCurrentUser: () => Promise<User | null>;
    };
    clients: {
        list: (userId: string) => Promise<Client[]>;
        create: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
        update: (id: string, client: Partial<Client>) => Promise<Client>;
        delete: (id: string) => Promise<void>;
    };
    invoices: {
        list: (userId: string) => Promise<Invoice[]>;
        get: (id: string) => Promise<Invoice | null>;
        create: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
        update: (id: string, invoice: Partial<Invoice>) => Promise<Invoice>;
        delete: (id: string) => Promise<void>;
    };
}
