import { useEffect, useState } from 'react';
import { useAuth } from '../stores/authStore';
import { mockApi } from '../services/mockApi';
import { Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        clients: 0,
        invoices: 0,
        revenue: 0,
        pending: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            if (user) {
                const [clients, invoices] = await Promise.all([
                    mockApi.clients.list(user.id),
                    mockApi.invoices.list(user.id)
                ]);

                const revenue = invoices
                    .filter(i => i.status === 'paid')
                    .reduce((acc, curr) => acc + curr.totalAmount, 0);

                const pending = invoices.filter(i => i.status !== 'paid').length;

                setStats({
                    clients: clients.length,
                    invoices: invoices.length,
                    revenue,
                    pending
                });
            }
        };
        loadStats();
    }, [user]);

    const cards = [
        { label: 'Total Clients', value: stats.clients, icon: Users, color: 'bg-blue-500' },
        { label: 'Invoices Created', value: stats.invoices, icon: FileText, color: 'bg-indigo-500' },
        { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: CheckCircle, color: 'bg-green-500' },
        { label: 'Pending Invoices', value: stats.pending, icon: AlertCircle, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of your business</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                                <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
                <div className="text-gray-500 text-sm">
                    No recent activity to display. Start by creating an invoice!
                </div>
            </div>
        </div>
    );
};
