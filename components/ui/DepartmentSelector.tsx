import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase/client';
import { ChevronDown, Search, Check, Users, DollarSign } from 'lucide-react';

interface Department {
    id: string;
    name: string;
    description: string;
    budget: number;
    member_count: number;
}

interface DepartmentSelectorProps {
    companyId: string;
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    multi?: boolean;
    placeholder?: string;
    disabled?: boolean;
    showStats?: boolean;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
    companyId,
    value,
    onChange,
    multi = false,
    placeholder = 'Select department...',
    disabled = false,
    showStats = true
}) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredDept, setHoveredDept] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadDepartments();
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

    const loadDepartments = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .eq('company_id', companyId)
                .order('name');

            if (error) throw error;
            setDepartments(data || []);
        } catch (error) {
            console.error('Error loading departments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedDepts = Array.isArray(value) ? value : (value ? [value] : []);
    const selectedDeptObjects = departments.filter(d => selectedDepts.includes(d.id));

    const handleSelect = (deptId: string) => {
        if (multi) {
            const newValue = selectedDepts.includes(deptId)
                ? selectedDepts.filter(id => id !== deptId)
                : [...selectedDepts, deptId];
            onChange?.(newValue);
        } else {
            onChange?.(deptId);
            setIsOpen(false);
        }
    };

    const displayText = multi
        ? selectedDeptObjects.length > 0
            ? `${selectedDeptObjects.length} department(s) selected`
            : placeholder
        : selectedDeptObjects[0]?.name || placeholder;

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className={selectedDepts.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
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
                                placeholder="Search departments..."
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
                            <div className="p-4 text-center text-gray-500">Loading departments...</div>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No departments found</div>
                        ) : (
                            filteredDepartments.map(dept => (
                                <div
                                    key={dept.id}
                                    onMouseEnter={() => setHoveredDept(dept.id)}
                                    onMouseLeave={() => setHoveredDept(null)}
                                    className="relative"
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(dept.id)}
                                        className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-blue-50 transition-colors ${selectedDepts.includes(dept.id) ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{dept.name}</div>
                                            <div className="text-xs text-gray-600">{dept.description}</div>
                                            {showStats && (
                                                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {dept.member_count} members
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" />
                                                        ${dept.budget.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {selectedDepts.includes(dept.id) && (
                                            <Check className="w-4 h-4 text-blue-600 ml-2" />
                                        )}
                                    </button>

                                    {/* Stats Tooltip */}
                                    {showStats && hoveredDept === dept.id && (
                                        <div className="absolute left-full top-0 ml-2 bg-gray-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-50">
                                            <div className="font-semibold mb-1">{dept.name}</div>
                                            <div>Members: {dept.member_count}</div>
                                            <div>Budget: ${dept.budget.toLocaleString()}</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {multi && selectedDepts.length > 0 && (
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

export default DepartmentSelector;

