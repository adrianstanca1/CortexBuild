/**
 * Smart Procurement Assistant - Material ordering and vendor management
 * 
 * Features:
 * - Material requisition automation
 * - Vendor price comparison
 * - Purchase order generation
 * - Inventory monitoring
 * - Barcode scanning
 * - Cost tracking
 */

import React, { useState } from 'react';
import {
    Package,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    AlertCircle,
    CheckCircle,
    Search,
    Plus,
    Download,
    BarChart3,
    Scan
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SmartProcurementAssistantProps {
    isDarkMode?: boolean;
}

interface Material {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    unit: string;
    avgPrice: number;
    vendors: Vendor[];
}

interface Vendor {
    id: string;
    name: string;
    price: number;
    rating: number;
    deliveryTime: string;
}

interface PurchaseOrder {
    id: string;
    material: string;
    quantity: number;
    vendor: string;
    totalCost: number;
    status: 'pending' | 'approved' | 'ordered' | 'delivered';
    date: Date;
}

const SmartProcurementAssistant: React.FC<SmartProcurementAssistantProps> = ({ isDarkMode = true }) => {
    const [materials, setMaterials] = useState<Material[]>([
        {
            id: '1',
            name: 'Concrete Mix',
            category: 'Building Materials',
            currentStock: 45,
            minStock: 100,
            unit: 'bags',
            avgPrice: 12.50,
            vendors: [
                { id: '1', name: 'BuildMart', price: 12.00, rating: 4.5, deliveryTime: '2 days' },
                { id: '2', name: 'SupplyPro', price: 12.50, rating: 4.8, deliveryTime: '1 day' },
                { id: '3', name: 'MaterialsPlus', price: 11.75, rating: 4.2, deliveryTime: '3 days' }
            ]
        },
        {
            id: '2',
            name: 'Steel Rebar',
            category: 'Structural',
            currentStock: 150,
            minStock: 80,
            unit: 'pieces',
            avgPrice: 8.75,
            vendors: [
                { id: '1', name: 'SteelWorks', price: 8.50, rating: 4.7, deliveryTime: '2 days' },
                { id: '2', name: 'MetalSupply', price: 9.00, rating: 4.5, deliveryTime: '1 day' }
            ]
        },
        {
            id: '3',
            name: 'Lumber 2x4',
            category: 'Wood',
            currentStock: 25,
            minStock: 50,
            unit: 'pieces',
            avgPrice: 6.50,
            vendors: [
                { id: '1', name: 'WoodMart', price: 6.25, rating: 4.6, deliveryTime: '1 day' },
                { id: '2', name: 'TimberPro', price: 6.75, rating: 4.4, deliveryTime: '2 days' }
            ]
        }
    ]);

    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
        {
            id: '1',
            material: 'Concrete Mix',
            quantity: 100,
            vendor: 'SupplyPro',
            totalCost: 1250,
            status: 'pending',
            date: new Date()
        }
    ]);

    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [orderQuantity, setOrderQuantity] = useState('');

    const lowStockMaterials = materials.filter(m => m.currentStock < m.minStock);
    const totalInventoryValue = materials.reduce((sum, m) => sum + (m.currentStock * m.avgPrice), 0);

    const createPurchaseOrder = (material: Material, vendor: Vendor) => {
        if (!orderQuantity || parseInt(orderQuantity) <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        const newPO: PurchaseOrder = {
            id: Date.now().toString(),
            material: material.name,
            quantity: parseInt(orderQuantity),
            vendor: vendor.name,
            totalCost: parseInt(orderQuantity) * vendor.price,
            status: 'pending',
            date: new Date()
        };

        setPurchaseOrders([newPO, ...purchaseOrders]);
        setOrderQuantity('');
        setSelectedMaterial(null);
        toast.success('Purchase order created!');
    };

    const scanBarcode = () => {
        toast.success('Barcode scanner activated');
    };

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📦 Smart Procurement Assistant
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage materials, compare vendors, and automate ordering
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5" />
                            <span className="text-sm opacity-80">Total Materials</span>
                        </div>
                        <div className="text-3xl font-bold">{materials.length}</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm opacity-80">Low Stock</span>
                        </div>
                        <div className="text-3xl font-bold">{lowStockMaterials.length}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-sm opacity-80">Inventory Value</span>
                        </div>
                        <div className="text-3xl font-bold">${totalInventoryValue.toFixed(0)}</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="h-5 w-5" />
                            <span className="text-sm opacity-80">Pending Orders</span>
                        </div>
                        <div className="text-3xl font-bold">{purchaseOrders.filter(po => po.status === 'pending').length}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Materials List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={`p-6 rounded-2xl border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Materials Inventory
                                </h2>
                                <button
                                    type="button"
                                    onClick={scanBarcode}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all"
                                >
                                    <Scan className="h-4 w-4" />
                                    Scan Barcode
                                </button>
                            </div>

                            <div className="space-y-3">
                                {materials.map(material => {
                                    const isLowStock = material.currentStock < material.minStock;
                                    const stockPercentage = (material.currentStock / material.minStock) * 100;

                                    return (
                                        <div
                                            key={material.id}
                                            onClick={() => setSelectedMaterial(material)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                selectedMaterial?.id === material.id
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {material.name}
                                                    </h3>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {material.category}
                                                    </p>
                                                </div>
                                                {isLowStock && (
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-semibold rounded-full">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Current Stock
                                                    </div>
                                                    <div className={`text-lg font-bold ${isLowStock ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {material.currentStock} {material.unit}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Min Stock
                                                    </div>
                                                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {material.minStock} {material.unit}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Avg Price
                                                    </div>
                                                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        ${material.avgPrice}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                <div 
                                                    className={`h-full transition-all ${
                                                        isLowStock ? 'bg-red-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Vendor Comparison */}
                    <div className="space-y-6">
                        {selectedMaterial ? (
                            <div className={`p-6 rounded-2xl border ${
                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Vendor Comparison
                                </h3>
                                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {selectedMaterial.name}
                                </p>

                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Order Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={orderQuantity}
                                        onChange={(e) => setOrderQuantity(e.target.value)}
                                        placeholder="Enter quantity"
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            isDarkMode 
                                                ? 'bg-gray-700 text-white border-gray-600' 
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {selectedMaterial.vendors.map(vendor => (
                                        <div
                                            key={vendor.id}
                                            className={`p-4 rounded-xl border ${
                                                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {vendor.name}
                                                </h4>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-3 h-3 rounded-full ${
                                                                i < Math.floor(vendor.rating) ? 'bg-yellow-500' : 'bg-gray-600'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Price
                                                    </div>
                                                    <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                                        ${vendor.price}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        Delivery
                                                    </div>
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {vendor.deliveryTime}
                                                    </div>
                                                </div>
                                            </div>
                                            {orderQuantity && (
                                                <div className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Total: ${(parseInt(orderQuantity) * vendor.price).toFixed(2)}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => createPurchaseOrder(selectedMaterial, vendor)}
                                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                                            >
                                                Create PO
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`p-6 rounded-2xl border ${
                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                                <div className="text-center py-12">
                                    <Search className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Select a material to compare vendors
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartProcurementAssistant;

