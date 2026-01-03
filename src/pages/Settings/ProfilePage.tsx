import { useForm } from 'react-hook-form';
import { useAuth } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

type SettingsForm = {
    businessName: string;
    businessAddress: string;
    logoUrl: string;
};

export const SettingsPage = () => {
    const { user } = useAuth();
    // Note: Updating user in mock mode is tricky because session is in authStore state
    // ideally we would add an updateProfile method to authStore/api.
    // For now, this is a visual implementation.

    const { register, handleSubmit } = useForm<SettingsForm>({
        defaultValues: {
            businessName: user?.businessName || '',
            businessAddress: user?.businessAddress || '',
            logoUrl: user?.logoUrl || '',
        }
    });

    const onSubmit = (_data: SettingsForm) => {
        alert('Settings saved (Mock Only - Refresh will reset in this demo)');
        // In real app, call updateProfile
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your business profile</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-6">Business Details</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input label="Business Name" {...register('businessName')} />
                    <div>
                        <label className="text-sm font-medium">Business Address</label>
                        <textarea
                            {...register('businessAddress')}
                            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24"
                        />
                    </div>
                    <Input label="Logo URL" {...register('logoUrl')} placeholder="https://example.com/logo.png" />

                    <div className="pt-4">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
