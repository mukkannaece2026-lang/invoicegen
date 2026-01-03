import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mockApi } from '../../services/mockApi';
import { useAuth } from '../../stores/authStore';
import type { Client } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Edit2, Trash2, X, Phone, Mail, MapPin } from 'lucide-react';

const clientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export const ClientsPage = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientForm>({
        resolver: zodResolver(clientSchema)
    });

    const fetchClients = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await mockApi.clients.list(user.id);
            setClients(data);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [user]);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onSubmit = async (data: ClientForm) => {
        if (!user) return;
        try {
            if (editingClient) {
                await mockApi.clients.update(editingClient.id, data);
            } else {
                await mockApi.clients.create({ ...data, userId: user.id });
            }
            setIsModalOpen(false);
            reset();
            setEditingClient(null);
            fetchClients();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this client?')) {
            await mockApi.clients.delete(id);
            fetchClients();
        }
    };

    const openEdit = (client: Client) => {
        setEditingClient(client);
        reset(client);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingClient(null);
        reset({ name: '', email: '', phone: '', address: '' });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-500">Manage your customer base</p>
                </div>
                <Button onClick={openCreate} className="w-full sm:w-auto shadow-lg shadow-indigo-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Client
                </Button>
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-md border border-gray-200">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="flex-1 outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading clients...</div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No clients found.</p>
                    <Button variant="outline" className="mt-4" onClick={openCreate}>Add your first client</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{client.name}</h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <Mail className="w-3 h-3 mr-2" />
                                        {client.email}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => openEdit(client)} className="text-gray-400 hover:text-blue-600">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(client.id)} className="text-gray-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                                {client.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                        {client.phone}
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-start">
                                        <MapPin className="w-3 h-3 mr-2 mt-1 text-gray-400" />
                                        {client.address}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">
                                {editingClient ? 'Edit Client' : 'New Client'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <Input label="Name" {...register('name')} error={errors.name?.message} />
                            <Input label="Email" {...register('email')} error={errors.email?.message} />
                            <Input label="Phone" {...register('phone')} />
                            <Input label="Address" {...register('address')} />

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingClient ? 'Update Client' : 'Create Client'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
