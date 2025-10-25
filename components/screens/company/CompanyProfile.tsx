import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { Building2, Mail, Phone, MapPin, Globe, Save, X } from 'lucide-react';

interface CompanyData {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    website: string;
    logo: string;
    description: string;
    industry: string;
    employeeCount: number;
}

interface CompanyProfileProps {
    currentUser: User;
    onClose?: () => void;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ currentUser, onClose }) => {
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<CompanyData>>({});

    useEffect(() => {
        loadCompanyData();
    }, [currentUser]);

    const loadCompanyData = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('id', currentUser.companyId)
                .single();

            if (error) throw error;
            setCompany(data);
            setFormData(data);
        } catch (error) {
            console.error('Error loading company data:', error);
            toast.error('Failed to load company information');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const { error } = await supabase
                .from('companies')
                .update(formData)
                .eq('id', currentUser.companyId);

            if (error) throw error;
            setCompany(formData as CompanyData);
            setIsEditing(false);
            toast.success('Company information updated successfully');
        } catch (error) {
            console.error('Error saving company data:', error);
            toast.error('Failed to save company information');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(company || {});
        setIsEditing(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">No company information found</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
                </div>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Company name"
                            title="Company name"
                        />
                    ) : (
                        <p className="text-gray-900 font-semibold">{company.name}</p>
                    )}
                </div>

                {/* Industry */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="industry"
                            value={formData.industry || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Industry"
                            title="Industry"
                        />
                    ) : (
                        <p className="text-gray-900">{company.industry || 'N/A'}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                    </label>
                    {isEditing ? (
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Email"
                            title="Email"
                        />
                    ) : (
                        <p className="text-gray-900">{company.email}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Phone
                    </label>
                    {isEditing ? (
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Phone"
                            title="Phone"
                        />
                    ) : (
                        <p className="text-gray-900">{company.phone || 'N/A'}</p>
                    )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Address
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Address"
                            title="Address"
                        />
                    ) : (
                        <p className="text-gray-900">{company.address || 'N/A'}</p>
                    )}
                </div>

                {/* City, State, Zip */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="City"
                            title="City"
                        />
                    ) : (
                        <p className="text-gray-900">{company.city || 'N/A'}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    {isEditing ? (
                        <input
                            type="text"
                            name="state"
                            value={formData.state || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="State"
                            title="State"
                        />
                    ) : (
                        <p className="text-gray-900">{company.state || 'N/A'}</p>
                    )}
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Website
                    </label>
                    {isEditing ? (
                        <input
                            type="url"
                            name="website"
                            value={formData.website || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Website"
                            title="Website"
                        />
                    ) : (
                        <p className="text-gray-900">{company.website || 'N/A'}</p>
                    )}
                </div>

                {/* Employee Count */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                    {isEditing ? (
                        <input
                            type="number"
                            name="employeeCount"
                            value={formData.employeeCount || 0}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Employee count"
                            title="Employee count"
                        />
                    ) : (
                        <p className="text-gray-900">{company.employeeCount || 0}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
                <div className="flex gap-3 mt-8">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default CompanyProfile;

