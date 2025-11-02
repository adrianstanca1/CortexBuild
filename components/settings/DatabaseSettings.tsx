/**
 * Database Settings Component
 * Allows users to toggle between SQLite and Supabase databases
 * and manage data migration/sync
 */

import React, { useState } from 'react';
import { useDatabase } from '../../lib/database/DatabaseProvider';
import { Database, CloudOff, Cloud, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const DatabaseSettings: React.FC = () => {
  const { mode, isConnected, switchDatabase, reconnect, exportData, importData } = useDatabase();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleDatabaseSwitch = async (newMode: 'sqlite' | 'supabase') => {
    if (newMode === mode) return;

    // Warn user about switching
    if (!confirm(`Switch to ${newMode === 'sqlite' ? 'SQLite (Local)' : 'Supabase (Cloud)'}? This will disconnect from the current database.`)) {
      return;
    }

    setIsSwitching(true);
    try {
      await switchDatabase(newMode);
      toast.success(`Switched to ${newMode === 'sqlite' ? 'SQLite' : 'Supabase'} successfully!`);
    } catch (error) {
      toast.error(`Failed to switch database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cortexbuild-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!confirm('This will import data into the current database. Existing data may be overwritten. Continue?')) {
        setIsImporting(false);
        return;
      }

      await importData(data);
      toast.success('Data imported successfully!');
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleReconnect = async () => {
    try {
      await reconnect();
      toast.success('Reconnected successfully!');
    } catch (error) {
      toast.error(`Reconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Database Settings</h2>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Connection Status</span>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Current Database</span>
          <div className="flex items-center gap-2">
            {mode === 'sqlite' ? (
              <CloudOff className="w-4 h-4 text-gray-600" />
            ) : (
              <Cloud className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm text-gray-900 font-medium">
              {mode === 'sqlite' ? 'SQLite (Local)' : 'Supabase (Cloud)'}
            </span>
          </div>
        </div>
      </div>

      {/* Database Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Database Provider
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* SQLite Option */}
          <button
            onClick={() => handleDatabaseSwitch('sqlite')}
            disabled={mode === 'sqlite' || isSwitching}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${mode === 'sqlite' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <CloudOff className={`w-8 h-8 ${mode === 'sqlite' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">SQLite</span>
              <span className="text-xs text-gray-500 text-center">Local Database</span>
              {mode === 'sqlite' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
              )}
            </div>
          </button>

          {/* Supabase Option */}
          <button
            onClick={() => handleDatabaseSwitch('supabase')}
            disabled={mode === 'supabase' || isSwitching}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${mode === 'supabase' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${isSwitching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <Cloud className={`w-8 h-8 ${mode === 'supabase' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">Supabase</span>
              <span className="text-xs text-gray-500 text-center">Cloud Database</span>
              {mode === 'supabase' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export Data */}
          <button
            onClick={handleExportData}
            disabled={isExporting || !isConnected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isExporting ? 'Exporting...' : 'Export Data'}
            </span>
          </button>

          {/* Import Data */}
          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isImporting ? 'Importing...' : 'Import Data'}
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              disabled={isImporting || !isConnected}
              className="hidden"
            />
          </label>

          {/* Reconnect */}
          <button
            onClick={handleReconnect}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Reconnect</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Database Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>SQLite:</strong> Local database stored on your device. Faster, works offline, but not synced across devices.</li>
          <li>• <strong>Supabase:</strong> Cloud database hosted on Supabase. Synced across devices, real-time updates, requires internet.</li>
          <li>• Use Export/Import to migrate data between databases.</li>
        </ul>
      </div>
    </div>
  );
};


