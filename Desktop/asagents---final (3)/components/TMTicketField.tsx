import React, { useState, useRef } from 'react';
import { User, Project } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface TMTicketFieldProps {
  user: User;
  project: Project;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface LaborLine {
  id: string;
  quantity: number;
  trade: string;
  hours: number;
  costCode: string;
  rate?: number;
}

interface MaterialLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  cost: number;
}

interface EquipmentLine {
  id: string;
  description: string;
  hours: number;
  rate: number;
}

export const TMTicketField: React.FC<TMTicketFieldProps> = ({
  user,
  project,
  onBack,
  addToast
}) => {
  const [title, setTitle] = useState('');
  const [labor, setLabor] = useState<LaborLine[]>([]);
  const [materials, setMaterials] = useState<MaterialLine[]>([]);
  const [equipment, setEquipment] = useState<EquipmentLine[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [clientName, setClientName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLaborLine = () => {
    const newLine: LaborLine = {
      id: Date.now().toString(),
      quantity: 1,
      trade: '',
      hours: 0,
      costCode: '',
      rate: 0
    };
    setLabor([...labor, newLine]);
  };

  const updateLaborLine = (id: string, field: keyof LaborLine, value: any) => {
    setLabor(labor.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLaborLine = (id: string) => {
    setLabor(labor.filter(l => l.id !== id));
  };

  const addMaterialLine = () => {
    const newLine: MaterialLine = {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      unit: 'ea',
      cost: 0
    };
    setMaterials([...materials, newLine]);
  };

  const updateMaterialLine = (id: string, field: keyof MaterialLine, value: any) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMaterialLine = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const addEquipmentLine = () => {
    const newLine: EquipmentLine = {
      id: Date.now().toString(),
      description: '',
      hours: 0,
      rate: 0
    };
    setEquipment([...equipment, newLine]);
  };

  const updateEquipmentLine = (id: string, field: keyof EquipmentLine, value: any) => {
    setEquipment(equipment.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEquipmentLine = (id: string) => {
    setEquipment(equipment.filter(e => e.id !== id));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);
  };

  // Signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    setSignature(dataUrl);
    setIsSignaturePadOpen(false);
    addToast('Signature captured', 'success');
  };

  const calculateTotal = () => {
    const laborTotal = labor.reduce((sum, l) => sum + (l.quantity * l.hours * (l.rate || 0)), 0);
    const materialTotal = materials.reduce((sum, m) => sum + (m.quantity * m.cost), 0);
    const equipmentTotal = equipment.reduce((sum, e) => sum + (e.hours * e.rate), 0);
    return laborTotal + materialTotal + equipmentTotal;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      addToast('Please enter a T&M title', 'error');
      return;
    }

    if (labor.length === 0 && materials.length === 0 && equipment.length === 0) {
      addToast('Please add at least one line item', 'error');
      return;
    }

    if (!clientName.trim()) {
      addToast('Please enter client name', 'error');
      return;
    }

    if (!signature) {
      addToast('Please capture client signature', 'error');
      return;
    }

    // Generate T&M ticket
    addToast('T&M ticket submitted and CO draft created', 'success');
    onBack();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800 mb-2">T&M Ticket</h2>
          <input
            type="text"
            placeholder="T&M Title (e.g., Extra framing at Level 3)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Labor */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Labor</h3>
          <div className="space-y-2">
            {labor.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="number"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateLaborLine(line.id, 'quantity', Number(e.target.value))}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Trade"
                  value={line.trade}
                  onChange={(e) => updateLaborLine(line.id, 'trade', e.target.value)}
                  className="col-span-3 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Hours"
                  value={line.hours}
                  onChange={(e) => updateLaborLine(line.id, 'hours', Number(e.target.value))}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={line.costCode}
                  onChange={(e) => updateLaborLine(line.id, 'costCode', e.target.value)}
                  className="col-span-3 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Cost Code</option>
                  <option value="CC-201">CC-201</option>
                  <option value="CC-202">CC-202</option>
                </select>
                <button
                  onClick={() => removeLaborLine(line.id)}
                  className="col-span-2 p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={addLaborLine}
            className="mt-2 w-full"
          >
            + Add Labor Line
          </Button>
        </div>

        {/* Materials */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Materials</h3>
          <div className="space-y-2">
            {materials.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateMaterialLine(line.id, 'description', e.target.value)}
                  className="col-span-5 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => updateMaterialLine(line.id, 'quantity', Number(e.target.value))}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={line.unit}
                  onChange={(e) => updateMaterialLine(line.id, 'unit', e.target.value)}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ea">ea</option>
                  <option value="sf">sf</option>
                  <option value="lf">lf</option>
                </select>
                <input
                  type="number"
                  placeholder="$"
                  value={line.cost}
                  onChange={(e) => updateMaterialLine(line.id, 'cost', Number(e.target.value))}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => removeMaterialLine(line.id)}
                  className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={addMaterialLine}
            className="mt-2 w-full"
          >
            + Add Material
          </Button>
        </div>

        {/* Equipment */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Equipment</h3>
          <div className="space-y-2">
            {equipment.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={line.description}
                  onChange={(e) => updateEquipmentLine(line.id, 'description', e.target.value)}
                  className="col-span-6 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Hours"
                  value={line.hours}
                  onChange={(e) => updateEquipmentLine(line.id, 'hours', Number(e.target.value))}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={line.rate}
                  onChange={(e) => updateEquipmentLine(line.id, 'rate', Number(e.target.value))}
                  className="col-span-3 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => removeEquipmentLine(line.id)}
                  className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
                />
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            onClick={addEquipmentLine}
            className="mt-2 w-full"
          >
            + Add Equipment
          </Button>
        </div>

        {/* Photos/Sketch */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Photos/Sketch ({photos.length})</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            📸 Add Photos
          </Button>
        </div>

        {/* Total */}
        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Estimated Total:</span>
            <span className="text-2xl font-bold text-slate-800">
              £{calculateTotal().toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Client Signature */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-700 mb-3">Client Signature</h3>
          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
          />
          
          {signature ? (
            <div className="border-2 border-gray-300 rounded-lg p-4">
              <img src={signature} alt="Signature" className="w-full h-32 object-contain" />
              <Button
                variant="secondary"
                onClick={() => {
                  setSignature(null);
                  setIsSignaturePadOpen(true);
                }}
                className="mt-2 w-full"
              >
                Clear & Re-sign
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsSignaturePadOpen(true)}
              className="w-full"
            >
              ✎ Capture Signature
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => addToast('Draft saved', 'success')}
            className="flex-1"
          >
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Get Signature & Submit
          </Button>
        </div>
      </Card>

      {/* Signature Modal */}
      {isSignaturePadOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg">
            <h3 className="font-semibold text-slate-700 mb-3">Client Signature</h3>
            <div className="border-2 border-gray-300 rounded-lg mb-3 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full cursor-crosshair"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={clearSignature}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsSignaturePadOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveSignature}
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
