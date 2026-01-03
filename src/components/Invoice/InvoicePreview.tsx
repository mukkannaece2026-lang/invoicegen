import { forwardRef } from 'react';
import type { Invoice, Client, User } from '../../types';
import { format } from 'date-fns';

interface InvoicePreviewProps {
    data: Partial<Invoice>;
    client?: Client;
    user?: User; // The sender (business)
}

const SAFE_COLORS = {
    white: '#ffffff',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    primary: '#6366f1', // Indigo 500
    primaryLight: '#e0e7ff', // Indigo 100/primary-10 approx
    primaryDark: '#4338ca', // Indigo 700
};

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(({ data, client, user }, ref) => {
    const calculateSubtotal = () => {
        return data.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
    };

    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * (data.taxRate || 0)) / 100;
    const total = subtotal + taxAmount;

    return (
        <div
            ref={ref}
            className="p-8 shadow-sm min-h-[1000px] w-full max-w-[800px] mx-auto text-sm"
            id="invoice-preview"
            style={{ backgroundColor: SAFE_COLORS.white }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    {user?.logoUrl ? (
                        <img src={user.logoUrl} alt="Logo" className="h-12 w-auto mb-4" />
                    ) : (
                        <div
                            className="h-12 w-12 rounded-lg flex items-center justify-center font-bold text-xl mb-4"
                            style={{ backgroundColor: SAFE_COLORS.primaryLight, color: SAFE_COLORS.primary }}
                        >
                            {user?.businessName?.[0] || 'B'}
                        </div>
                    )}
                    <h1 className="text-2xl font-bold" style={{ color: SAFE_COLORS.gray900 }}>{user?.businessName || 'Your Business'}</h1>
                    <div className="mt-2 whitespace-pre-line" style={{ color: SAFE_COLORS.gray500 }}>
                        {user?.businessAddress || 'Business Address'}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-light tracking-wide" style={{ color: SAFE_COLORS.primary }}>INVOICE</h2>
                    <div className="mt-4 space-y-1">
                        <p style={{ color: SAFE_COLORS.gray500 }}>Invoice #</p>
                        <p className="font-bold" style={{ color: SAFE_COLORS.gray900 }}>{data.invoiceNumber || 'INV-001'}</p>
                    </div>
                </div>
            </div>

            {/* Bill To / Details */}
            <div className="flex justify-between mb-12">
                <div>
                    <h3 className="font-medium mb-2 uppercase text-xs tracking-wider" style={{ color: SAFE_COLORS.gray500 }}>Bill To</h3>
                    {client ? (
                        <div style={{ color: SAFE_COLORS.gray900 }}>
                            <p className="font-bold text-lg">{client.name}</p>
                            <p>{client.email}</p>
                            <p className="whitespace-pre-line">{client.address}</p>
                            <p>{client.phone}</p>
                        </div>
                    ) : (
                        <p className="italic" style={{ color: SAFE_COLORS.gray300 }}>Select a client...</p>
                    )}
                </div>
                <div className="text-right space-y-2">
                    <div>
                        <span className="mr-4" style={{ color: SAFE_COLORS.gray500 }}>Date:</span>
                        <span className="font-medium" style={{ color: SAFE_COLORS.gray900 }}>{data.date ? format(new Date(data.date), 'MMM dd, yyyy') : '-'}</span>
                    </div>
                    <div>
                        <span className="mr-4" style={{ color: SAFE_COLORS.gray500 }}>Due Date:</span>
                        <span className="font-medium" style={{ color: SAFE_COLORS.gray900 }}>{data.dueDate ? format(new Date(data.dueDate), 'MMM dd, yyyy') : '-'}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${SAFE_COLORS.primaryLight}` }}>
                            <th className="py-3 text-left font-semibold" style={{ color: SAFE_COLORS.gray700 }}>Description</th>
                            <th className="py-3 text-right font-semibold" style={{ color: SAFE_COLORS.gray700 }}>Qty</th>
                            <th className="py-3 text-right font-semibold" style={{ color: SAFE_COLORS.gray700 }}>Price</th>
                            <th className="py-3 text-right font-semibold" style={{ color: SAFE_COLORS.gray700 }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: SAFE_COLORS.gray100 }}>
                        {data.items?.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: `1px solid ${SAFE_COLORS.gray100}` }}>
                                <td className="py-4" style={{ color: SAFE_COLORS.gray800 }}>{item.description}</td>
                                <td className="py-4 text-right" style={{ color: SAFE_COLORS.gray600 }}>{item.quantity}</td>
                                <td className="py-4 text-right" style={{ color: SAFE_COLORS.gray600 }}>${item.price.toFixed(2)}</td>
                                <td className="py-4 text-right font-medium" style={{ color: SAFE_COLORS.gray900 }}>
                                    ${(item.quantity * item.price).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between" style={{ color: SAFE_COLORS.gray600 }}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: SAFE_COLORS.gray600 }}>
                        <span>Tax ({data.taxRate || 0}%)</span>
                        <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-lg font-bold" style={{ borderColor: SAFE_COLORS.gray200, color: SAFE_COLORS.gray900 }}>
                        <span>Total</span>
                        <span style={{ color: SAFE_COLORS.primary }}>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Footer / Notes */}
            {data.notes && (
                <div className="mt-12 border-t pt-8" style={{ borderColor: SAFE_COLORS.gray100 }}>
                    <h4 className="font-semibold mb-2" style={{ color: SAFE_COLORS.gray900 }}>Notes</h4>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: SAFE_COLORS.gray500 }}>{data.notes}</p>
                </div>
            )}
        </div>
    );
});

InvoicePreview.displayName = 'InvoicePreview';
