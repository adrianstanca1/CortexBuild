import React, { useState, useRef } from 'react';
import { User, Project } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface DailyLogFieldProps {
  user: User;
  project: Project;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface CrewMember {
  id: string;
  name: string;
  hours: number;
  costCode: string;
}

interface QuantityInstalled {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export const DailyLogField: React.FC<DailyLogFieldProps> = ({
  user,
  project,
  onBack,
  addToast
}) => {
  const [weather, setWeather] = useState({ temp: '12°C', condition: 'Light Rain', wind: '2 m/s' });
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [quantities, setQuantities] = useState<QuantityInstalled[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      if (crew.length > 0 || quantities.length > 0 || notes) {
        setAutoSaveStatus('saving');
        setTimeout(() => {
          // Simulate save to local storage
          localStorage.setItem('daily-log-draft', JSON.stringify({
            date: new Date().toISOString(),
            project: project.id,
            crew,
            quantities,
            equipment,
            notes
          }));
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus(null), 2000);
        }, 500);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [crew, quantities, equipment, notes, project.id]);

  // Fetch weather on mount
  React.useEffect(() => {
    fetchWeather();
  }, [project]);

  const fetchWeather = async () => {
    // In real app, call weather API
    // Mock data for now
    setWeather({
      temp: '12°C',
      condition: 'Light Rain',
      wind: '2 m/s'
    });
  };

  const addCrewMember = () => {
    const newMember: CrewMember = {
      id: Date.now().toString(),
      name: '',
      hours: 8,
      costCode: ''
    };
    setCrew([...crew, newMember]);
  };

  const updateCrewMember = (id: string, field: keyof CrewMember, value: any) => {
    setCrew(crew.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeCrewMember = (id: string) => {
    setCrew(crew.filter(m => m.id !== id));
  };

  const addQuantity = () => {
    const newQty: QuantityInstalled = {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      unit: 'ea'
    };
    setQuantities([...quantities, newQty]);
  };

  const updateQuantity = (id: string, field: keyof QuantityInstalled, value: any) => {
    setQuantities(quantities.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuantity = (id: string) => {
    setQuantities(quantities.filter(q => q.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);
    addToast(`${files.length} photo(s) added`, 'success');
  };

  const startVoiceRecording = () => {
    setIsVoiceRecording(true);
    // In real app, use Web Speech API
    addToast('Voice recording started (simulated)', 'success');
  };

  const stopVoiceRecording = () => {
    setIsVoiceRecording(false);
    // Simulate voice-to-text
    setNotes(prev => prev + '\nWeather was challenging today. Completed framing on west wall.');
    addToast('Voice note added', 'success');
  };

  const handleSubmit = () => {
    // Validation
    if (crew.length === 0 && quantities.length === 0) {
      addToast('Please add either labor hours or quantities installed', 'error');
      return;
    }

    if (photos.length === 0) {
      const confirmed = window.confirm('No photos attached. Submit anyway?');
      if (!confirmed) return;
    }

    // Submit logic
    addToast('Daily log submitted successfully!', 'success');
    onBack();
  };

  const totalHours = crew.reduce((sum, m) => sum + m.hours, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        {autoSaveStatus && (
          <div className="text-xs text-slate-500">
            {autoSaveStatus === 'saving' ? '💾 Saving...' : '✓ Saved'}
          </div>
        )}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Daily Log</h2>
          <div className="text-sm text-slate-500">{project.name}</div>
        </div>
        <div className="text-sm text-slate-600 mb-4">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        {/* Weather */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌧️</div>
            <div>
              <p className="font-semibold text-slate-700">Weather</p>
              <p className="text-sm text-slate-600">
                {weather.temp} • {weather.condition} • {weather.wind}
              </p>
            </div>
          </div>
        </div>

        {/* Labor Hours */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Labor Hours</h3>
            <span className="text-sm text-slate-500">Total: {totalHours}h</span>
          </div>
          <div className="space-y-2">
            {crew.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => updateCrewMember(member.id, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Hours"
                  value={member.hours}
                  onChange={(e) => updateCrewMember(member.id, 'hours', Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={member.costCode}
                  onChange={(e) => updateCrewMember(member.id, 'costCode', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Code</option>
                  <option value="CC-201">CC-201</option>
                  <option value="CC-202">CC-202</option>
                </select>
                <button
                  onClick={() => removeCrewMember(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={addCrewMember}
            className="mt-2 w-full"
          >
            + Add Crew Member
          </Button>
        </div>

        {/* Quantities Installed */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Quantities Installed</h3>
          <div className="space-y-2">
            {quantities.map((qty) => (
              <div key={qty.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={qty.description}
                  onChange={(e) => updateQuantity(qty.id, 'description', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={qty.quantity}
                  onChange={(e) => updateQuantity(qty.id, 'quantity', Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={qty.unit}
                  onChange={(e) => updateQuantity(qty.id, 'unit', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ea">ea</option>
                  <option value="sf">sf</option>
                  <option value="lf">lf</option>
                  <option value="cy">cy</option>
                </select>
                <button
                  onClick={() => removeQuantity(qty.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={addQuantity}
            className="mt-2 w-full"
          >
            + Add Quantity
          </Button>
        </div>

        {/* Photos */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Photos ({photos.length})</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <div className="grid grid-cols-4 gap-2 mb-2">
            {photos.map((photo, index) => (
              <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            📸 Add Photos
          </Button>
        </div>

        {/* Notes / Blockers */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-700">Blockers / Notes</h3>
            <button
              onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isVoiceRecording ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
              }`}
            >
              🎙 {isVoiceRecording ? 'Stop' : 'Voice'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any notes, blockers, or observations..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              addToast('Draft saved', 'success');
            }}
            className="flex-1"
          >
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
};
