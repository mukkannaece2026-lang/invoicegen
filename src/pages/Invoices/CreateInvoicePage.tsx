import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/authStore';
import { mockApi } from '../../services/mockApi';
import type { Client } from '../../types';
import type { InvoiceItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { InvoicePreview } from '../../components/Invoice/InvoicePreview';
import { Plus, Save, Download, ArrowLeft, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

type InvoiceFormValues = {
    clientId: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    items: InvoiceItem[];
    notes?: string;
    taxRate: number;
};

export const CreateInvoicePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const pdfRef = useRef<HTMLDivElement>(null);

    const { register, control, watch, handleSubmit, setValue } = useForm<InvoiceFormValues>({
        defaultValues: {
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            date: format(new Date(), 'yyyy-MM-dd'),
            dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            items: [{ id: '1', description: 'Consulting Services', quantity: 1, price: 100 }],
            taxRate: 10,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const formValues = watch();

    useEffect(() => {
        const loadClients = async () => {
            if (user) {
                const data = await mockApi.clients.list(user.id);
                setClients(data);
                // If the currently selected client is not in the list (or no selection), select the first one
                const currentClientId = formValues.clientId;
                if (data.length > 0 && (!currentClientId || !data.find(c => c.id === currentClientId))) {
                    setValue('clientId', data[0].id);
                }
            }
        };
        loadClients();
    }, [user, setValue, formValues.clientId]); // Added dependencies to ensure updates

    const selectedClient = clients.find(c => c.id === formValues.clientId);

    const calculateTotal = () => {
        const subtotal = formValues.items?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0) || 0;
        const tax = (subtotal * (Number(formValues.taxRate) || 0)) / 100;
        return subtotal + tax;
    };

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            // Use pdfRef (off-screen) instead of previewRef (on-screen)
            if (!pdfRef.current) {
                console.error('PDF Reference is missing');
                alert('Failed to generate PDF: Reference missing. Please refresh and try again.');
                return;
            }

            // Wait a moment for rendering to stabilize (especially images)
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(pdfRef.current, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                windowWidth: 794 // Force A4 width
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice-${formValues.invoiceNumber || 'draft'}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. See console for details.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const onSubmit = async (data: InvoiceFormValues) => {
        if (!user) return;
        try {
            await mockApi.invoices.create({
                ...data,
                userId: user.id,
                status: 'sent',
                totalAmount: calculateTotal(),
                items: data.items.map(item => ({ ...item, quantity: Number(item.quantity), price: Number(item.price) }))
            });
            navigate('/invoices');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6 overflow-hidden relative">
            {/* Scrollable Form Area */}
            <div className="w-full md:w-1/2 flex flex-col h-full bg-white border-r border-gray-200 shadow-xl z-10">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1 className="font-bold text-lg">New Invoice</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf} isLoading={isGeneratingPdf}>
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button size="sm" onClick={handleSubmit(onSubmit)}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <section className="space-y-4">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Client & Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-medium">Select Client</label>
                                {clients.length === 0 ? (
                                    <div className="mt-1 p-2 border border-yellow-300 bg-yellow-50 rounded-md text-sm text-yellow-800 flex justify-between items-center">
                                        <span>No clients found.</span>
                                        <Button size="sm" variant="outline" onClick={() => navigate('/clients')}>Add Client</Button>
                                    </div>
                                ) : (
                                    <select
                                        {...register('clientId')}
                                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <Input label="Invoice Number" {...register('invoiceNumber')} />
                            <Input label="Tax Rate (%)" type="number" {...register('taxRate')} />
                            <Input label="Date" type="date" {...register('date')} />
                            <Input label="Due Date" type="date" {...register('dueDate')} />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Line Items</h2>
                            <Button size="sm" variant="ghost" onClick={() => append({ id: Date.now().toString(), description: '', quantity: 1, price: 0 })}>
                                <Plus className="w-4 h-4" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded-md border border-gray-100">
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder="Description" {...register(`items.${index}.description`)} />
                                        <div className="flex gap-2">
                                            <div className="w-24">
                                                <Input type="number" placeholder="Qty" {...register(`items.${index}.quantity`)} />
                                            </div>
                                            <div className="w-32">
                                                <Input type="number" placeholder="Price" {...register(`items.${index}.price`)} />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => remove(index)} className="mt-2 text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            {...register('notes')}
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24"
                            placeholder="Payment terms, bank details, etc."
                        />
                    </section>
                </div>
            </div>

            {/* Live Preview Area (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 bg-gray-100 items-start justify-center p-8 overflow-y-auto">
                <div className="scale-[0.8] origin-top shadow-2xl">
                    <InvoicePreview
                        ref={previewRef}
                        data={formValues}
                        client={selectedClient}
                        user={user || undefined}
                    />
                </div>
            </div>

            {/* Hidden Off-Screen Canvas for PDF Generation (Always Rendered) 
                Using fixed/opacity-0 ensures it's correctly calculated by the layout engine 
                without being visible to the user.
            */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '794px', // A4 Width
                zIndex: -1000,
                opacity: 0,
                pointerEvents: 'none'
            }}>
                <InvoicePreview
                    ref={pdfRef}
                    data={formValues}
                    client={selectedClient}
                    user={user || undefined}
                />
            </div>
        </div>
    );
};

export default CreateInvoicePage;
