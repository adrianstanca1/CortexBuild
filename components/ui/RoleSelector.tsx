import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase/client';
import { ChevronDown, Search, Check } from 'lucide-react';

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

interface RoleSelectorProps {
    companyId: string;
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    multi?: boolean;
    placeholder?: string;
    disabled?: boolean;
    showPermissions?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
    companyId,
    value,
    onChange,
    multi = false,
    placeholder = 'Select role...',
    disabled = false,
    showPermissions = true
}) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredRole, setHoveredRole] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadRoles();
    }, [companyId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadRoles = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('custom_roles')
                .select('*')
                .eq('company_id', companyId)
                .order('name');

            if (error) throw error;
            setRoles(data || []);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedRoles = Array.isArray(value) ? value : (value ? [value] : []);
    const selectedRoleObjects = roles.filter(r => selectedRoles.includes(r.id));

    const handleSelect = (roleId: string) => {
        if (multi) {
            const newValue = selectedRoles.includes(roleId)
                ? selectedRoles.filter(id => id !== roleId)
                : [...selectedRoles, roleId];
            onChange?.(newValue);
        } else {
            onChange?.(roleId);
            setIsOpen(false);
        }
    };

    const displayText = multi
        ? selectedRoleObjects.length > 0
            ? `${selectedRoleObjects.length} role(s) selected`
            : placeholder
        : selectedRoleObjects[0]?.name || placeholder;

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className={selectedRoles.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                    {displayText}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500">Loading roles...</div>
                        ) : filteredRoles.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No roles found</div>
                        ) : (
                            filteredRoles.map(role => (
                                <div
                                    key={role.id}
                                    onMouseEnter={() => setHoveredRole(role.id)}
                                    onMouseLeave={() => setHoveredRole(null)}
                                    className="relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(role.id)}
                                        className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedRoles.includes(role.id) ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{role.name}</div>
                                            <div className="text-xs text-gray-600">{role.description}</div>
                                        </div>
                                        {selectedRoles.includes(role.id) && (
                                            <Check className="w-4 h-4 text-blue-600 ml-2" />
                                        )}
                                    </button>

                                    {/* Permissions Tooltip */}
                                    {showPermissions && hoveredRole === role.id && role.permissions.length > 0 && (
                                        <div className="absolute left-full top-0 ml-2 bg-gray-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-50">
                                            <div className="font-semibold mb-1">Permissions:</div>
                                            <div className="space-y-1">
                                                {role.permissions.slice(0, 5).map(perm => (
                                                    <div key={perm}>• {perm}</div>
                                                ))}
                                                {role.permissions.length > 5 && (
                                                    <div>• +{role.permissions.length - 5} more</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {multi && selectedRoles.length > 0 && (
                        <div className="p-3 border-t border-gray-200 flex justify-between">
                            <button
                                type="button"
                                onClick={() => onChange?.([])}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Clear all
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoleSelector;

