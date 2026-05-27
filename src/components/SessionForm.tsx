import { useState } from 'react';
import { Session, PC } from '../types';
import ReactMarkdown from 'react-markdown';

interface SessionFormProps {
  // Editing session (undefined when creating new)
  session?: Session;
  // List of available player characters
  availablePCs: PC[];
  // Callback on form submit
  onSubmit: (data: any) => Promise<void>;
  // Callback on close
  onClose: () => void;
}

export function SessionForm({ session, availablePCs, onSubmit, onClose }: SessionFormProps) {
  // Initialize form data - ensure date is in YYYY-MM-DD format
 /*  const [formData, setFormData] = useState<any>(
    session
      ? {
          ...session,
          // Ensure date is properly formatted (remove time part if present)
          date: session.date ? session.date.split('T')[0] : '',
        }
      : {
          name: '',
          description: '',
          date: '',
          notes: '',
          pcids: [] as string[],
          npcids: [] as string[],
          twistids: [] as string[],
        }
  ); */
  const [formData, setFormData] = useState<{
  name: string;
  description: string;
  date: string;
  notes: string;
  pc_ids: string[];
  npc_ids: string[];
  twist_ids: string[];
}>(() => {
  if (session) {
    return {
      name: session.name || '',
      description: session.description || '',
      date: session.date ? session.date.split('T')[0] : '',
      notes: session.notes || '',
      // Ensure arrays from DB (snake_case)
      pc_ids: Array.isArray(session.pc_ids) ? session.pc_ids : [],
      npc_ids: Array.isArray(session.npc_ids) ? session.npc_ids : [],
      twist_ids: Array.isArray(session.twist_ids) ? session.twist_ids : [],
    };
  }
  return {
    name: '',
    description: '',
    date: '',
    notes: '',
    pc_ids: [],
    npc_ids: [],
    twist_ids: [],
  };
});

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // For date field, ensure proper YYYY-MM-DD format
    const processedValue = name === 'date' ? value.split('T')[0] : value;
    setFormData({ ...formData, [name]: processedValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle PC selection change
  const handlePCToggle = (pcId: string) => {
    setFormData({
      ...formData,
      pc_ids: formData.pc_ids.includes(pcId)
        ? formData.pc_ids.filter((id: string) => id !== pcId)
        : [...formData.pc_ids, pcId],
    });
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Session name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || null,
        date: formData.date || undefined,
        notes: formData.notes || null,
        pc_ids: formData.pc_ids || [],
        npc_ids: formData.npc_ids || [],
        twist_ids: formData.twist_ids || [],
      });
    } catch (error) {
      console.error('Failed to submit session:', error);
      alert('Ошибка при сохранении сессии. Попробуйте снова.');
    }
    
  };

  return (
    <>
      {/* Semi-transparent background */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        {/* Modal window */}
        <div
          className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 sticky top-0 bg-slate-900">
            <h2 className="text-xl font-bold text-white">
              {session ? 'Edit Session' : 'New Session'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Session Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Session 1 - The Beginning"
                className={`w-full px-3 py-2 bg-slate-800 text-white rounded border ${
                  errors.name ? 'border-red-500' : 'border-slate-700'
                } focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Brief summary of what happened in this session"
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Session Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                name="date"
                value={formData.date ? formData.date.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* PLAYER CHARACTERS SELECTION */}
            {availablePCs.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Player Characters
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  {availablePCs.map((pc) => (
                    <label key={pc.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Array.isArray(formData.pc_ids) && formData.pc_ids.includes(pc.id)}
                        onChange={() => handlePCToggle(pc.id)}
                        className="w-4 h-4 rounded accent-blue-500 cursor-pointer"
                      />
                      <span className="text-sm text-slate-100">{pc.name}</span>
                      {pc.player_name && (
                        <span className="text-xs text-slate-400">({pc.player_name})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES / LOG */}
            <div className="flex flex-col">
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    !showPreview
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    showPreview
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Preview
                </button>
              </div>

              {!showPreview ? (
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Session log and notes... supports Markdown"
                  rows={5}
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                />
              ) : (
                <div className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white overflow-y-auto max-h-48">
                  <div className="prose prose-invert max-w-none text-sm">
                    <ReactMarkdown>{formData.notes || ''}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-white"
              >
                {session ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
