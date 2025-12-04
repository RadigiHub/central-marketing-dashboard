// pages/brands.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import supabase from '../lib/supabase';
import Layout from '../components/Layout';

const STATUS_OPTIONS = ['All', 'On Track', 'In Progress'];
const PRIORITY_LABELS = {
  1: 'High',
  2: 'Medium',
  3: 'Normal',
};

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leadFilter, setLeadFilter] = useState('All');

  const [editingBrand, setEditingBrand] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 🔹 Load brands from Supabase
  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('Brands')
      .select('*')
      .order('priority', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error(error);
      setError('Could not load brands.');
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  }

  // 🔹 Derived filters
  const teamLeads = useMemo(() => {
    const leads = new Set();
    brands.forEach((b) => {
      if (b.team_lead) leads.add(b.team_lead);
    });
    return ['All', ...Array.from(leads)];
  }, [brands]);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (leadFilter !== 'All' && b.team_lead !== leadFilter) return false;
      if (
        search &&
        !b.name.toLowerCase().includes(search.toLowerCase()) &&
        !(b.current_focus || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [brands, statusFilter, leadFilter, search]);

  function openCreateModal() {
    setEditingBrand(null);
    setShowModal(true);
  }

  function openEditModal(brand) {
    setEditingBrand(brand);
    setShowModal(true);
  }

  function closeModal() {
    setEditingBrand(null);
    setShowModal(false);
  }

  // 🔹 Create / Update brand
  async function handleSaveBrand(values) {
    setSaving(true);
    try {
      const payload = {
        name: values.name,
        team_lead: values.team_lead,
        status: values.status,
        current_focus: values.current_focus,
        website_url: values.website_url || null,
        category: values.category || null,
        priority: values.priority ? Number(values.priority) : 3,
        logo_url: values.logo_url || null,
      };

      if (values.id) {
        const { error } = await supabase
          .from('Brands')
          .update(payload)
          .eq('id', values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('Brands').insert(payload);
        if (error) throw error;
      }

      await fetchBrands();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Error saving brand – check console for details.');
    } finally {
      setSaving(false);
    }
  }

  // 🔹 Delete brand
  async function handleDeleteBrand(id) {
    if (!window.confirm('Delete this brand from dashboard?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('Brands').delete().eq('id', id);
      if (error) throw error;
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting brand.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Layout>
      <Head>
        <title>Brands • Central Marketing Dashboard</title>
      </Head>

      <div className="page-header">
        <div>
          <h1 className="page-title">Brands</h1>
          <p className="page-subtitle">
            Live snapshot of every brand under central marketing.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Add Brand
        </button>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="toolbar-group">
          <input
            type="text"
            placeholder="Search by brand or focus…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>
        <div className="toolbar-group">
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            className="select"
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value)}
          >
            {teamLeads.map((lead) => (
              <option key={lead}>{lead}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Brand Snapshot <span className="muted">({filteredBrands.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="card-body">Loading brands…</div>
        ) : error ? (
          <div className="card-body error">{error}</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Team Lead</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Current Focus</th>
                  <th>Category</th>
                  <th>Last Updated</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <div className="cell-brand">
                        {brand.logo_url && (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="brand-logo"
                          />
                        )}
                        <div>
                          <div className="brand-name">{brand.name}</div>
                          {brand.website_url && (
                            <a
                              href={brand.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="brand-link"
                            >
                              Visit site ↗
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{brand.team_lead || '—'}</td>
                    <td>
                      <StatusPill status={brand.status} />
                    </td>
                    <td>
                      <span className={`pill pill-priority-${brand.priority || 3}`}>
                        {PRIORITY_LABELS[brand.priority || 3]}
                      </span>
                    </td>
                    <td>{brand.current_focus}</td>
                    <td>{brand.category || '—'}</td>
                    <td>
                      {brand.last_update
                        ? new Date(brand.last_update).toLocaleString()
                        : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost"
                          onClick={() => openEditModal(brand)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          disabled={deletingId === brand.id}
                          onClick={() => handleDeleteBrand(brand.id)}
                        >
                          {deletingId === brand.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty">
                      No brands match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <BrandFormModal
          brand={editingBrand}
          onCancel={closeModal}
          onSave={handleSaveBrand}
          saving={saving}
        />
      )}
    </Layout>
  );
}

// 🔹 Status badge component
function StatusPill({ status }) {
  const normalized = (status || '').toLowerCase();
  let variant = 'neutral';
  if (normalized === 'on track') variant = 'success';
  else if (normalized === 'in progress') variant = 'warning';

  return <span className={`pill pill-${variant}`}>{status || '—'}</span>;
}

// 🔹 Modal form for create / edit
function BrandFormModal({ brand, onCancel, onSave, saving }) {
  const [form, setForm] = useState({
    id: brand?.id || null,
    name: brand?.name || '',
    team_lead: brand?.team_lead || '',
    status: brand?.status || 'On Track',
    current_focus: brand?.current_focus || '',
    website_url: brand?.website_url || '',
    category: brand?.category || '',
    priority: brand?.priority || 3,
    logo_url: brand?.logo_url || '',
  });

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Brand name is required.');
      return;
    }
    onSave(form);
  }

  const title = brand ? 'Edit Brand' : 'Add Brand';

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">{title}</h2>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <label>
              Brand name
              <input
                className="input"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </label>

            <label>
              Team lead
              <input
                className="input"
                value={form.team_lead}
                onChange={(e) => updateField('team_lead', e.target.value)}
              />
            </label>

            <label>
              Status
              <select
                className="select"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
              >
                <option>On Track</option>
                <option>In Progress</option>
              </select>
            </label>

            <label>
              Priority
              <select
                className="select"
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Normal</option>
              </select>
            </label>

            <label>
              Category
              <input
                className="input"
                placeholder="Travel, Fitness, SaaS…"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              />
            </label>

            <label>
              Website URL
              <input
                className="input"
                type="url"
                placeholder="https://…"
                value={form.website_url}
                onChange={(e) => updateField('website_url', e.target.value)}
              />
            </label>

            <label>
              Logo URL
              <input
                className="input"
                type="url"
                placeholder="https://… logo image"
                value={form.logo_url}
                onChange={(e) => updateField('logo_url', e.target.value)}
              />
            </label>
          </div>

          <label className="full-width">
            Current focus
            <textarea
              className="textarea"
              rows={3}
              value={form.current_focus}
              onChange={(e) => updateField('current_focus', e.target.value)}
            />
          </label>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
