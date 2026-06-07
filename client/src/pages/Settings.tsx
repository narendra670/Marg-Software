import { useState } from 'react';
import { FiSave, FiRotateCcw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCompanySettings, saveCompanySettings, CompanySettings } from '../utils/companySettings';

export default function Settings() {
  const [settings, setSettings] = useState<CompanySettings>(getCompanySettings());

  const update = (field: keyof CompanySettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveCompanySettings(settings);
    toast.success('Company settings saved');
  };

  const handleReset = () => {
    const defaults: CompanySettings = {
      name: 'PHARMA DISTRIBUTORS',
      address: '123, Medical Complex, Grant Road, Mumbai - 400001',
      phone: '+91-22-2288-1234',
      email: 'info@pharmadist.com',
      gst: '27AABCU9603R1Z1',
      dl: 'MH/2024/12345',
    };
    setSettings(defaults);
    saveCompanySettings(defaults);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Settings</h1>

      <div className="card space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            className="input-field"
            value={settings.name}
            onChange={(e) => update('name', e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            className="input-field"
            rows={2}
            value={settings.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              className="input-field"
              value={settings.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={settings.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
            <input
              type="text"
              className="input-field"
              value={settings.gst}
              onChange={(e) => update('gst', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Drug License No</label>
            <input
              type="text"
              className="input-field"
              value={settings.dl}
              onChange={(e) => update('dl', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <FiRotateCcw size={16} /> Reset to Default
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <FiSave size={16} /> Save Settings
          </button>
        </div>

        <p className="text-xs text-gray-400">
          These settings will appear on all your invoices. Changes apply to new invoices only.
        </p>
      </div>
    </div>
  );
}
