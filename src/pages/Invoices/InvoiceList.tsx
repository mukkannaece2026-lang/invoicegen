import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { mockApi } from '../../services/mockApi';
import type { Invoice, Client } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export const InvoicesPage = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Record<string, Client>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [invData, clientData] = await Promise.all([
                    mockApi.invoices.list(user.id),
                    mockApi.clients.list(user.id)
                ]);
                setInvoices(invData);

                // Map clients for easy lookup
                const clientMap = clientData.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
                setClients(clientMap);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [user]);

    const filteredInvoices = invoices.filter(inv => {
        if (filter === 'all') return true;
        return inv.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500">Track and manage your billing</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="ghost" onClick={() => window.location.reload()}>
                        Refresh
                    </Button>
                    <Link to="/invoices/new" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto shadow-lg shadow-indigo-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto">
                {(['all', 'paid', 'sent', 'draft', 'overdue'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-full capitalize whitespace-nowrap",
                            filter === status
                                ? "bg-primary text-white"
                                : "text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No invoices found.</div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {clients[inv.clientId]?.name || 'Unknown Client'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {inv.date ? format(new Date(inv.date), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {inv.dueDate ? format(new Date(inv.dueDate), 'MMM dd, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        ${inv.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn("px-2 py-1 text-xs font-semibold rounded-full capitalize", getStatusColor(inv.status))}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4 text-gray-500" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;
