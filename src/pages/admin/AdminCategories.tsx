import React, { useState } from 'react';
import { Layers, Plus, Edit2, CheckCircle2, XCircle, Power, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, toggleCategoryActive } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: catName.trim() as any,
        description: catDesc.trim(),
      });
    } else {
      await addCategory({
        name: catName.trim() as any,
        iconName: 'MapPin',
        description: catDesc.trim() || 'Community resource directory',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        isActive: true,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          title="Category Management Center"
          subtitle="Define, edit, and disable/enable resource categories across CrowdMap."
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Resource Categories ({categories.length})</h2>
              <p className="text-xs text-slate-500">Active categories appear on discovery filters and place submission forms.</p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const active = cat.isActive !== false;
              return (
                <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.color || 'bg-slate-100 text-slate-800'}`}>
                        {cat.name}
                      </span>
                      {active ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ENABLED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> DISABLED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="text-brand-700 hover:text-brand-800 font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit details
                    </button>

                    <button
                      onClick={() => toggleCategoryActive(cat.id)}
                      className={`font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                        active
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{active ? 'Disable' : 'Enable'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </main>
      </div>

      {/* Add / Edit Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCategory ? 'Edit Resource Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Printing or Transport"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Brief explanation of resources categorized under this label..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-sm"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
