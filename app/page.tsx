'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  Layers,
  AlertCircle,
  Search,
  RefreshCw,
} from 'lucide-react';

interface SapRequirement {
  id: string;
  client_company: string;
  title: string;
  description: string;
  sap_module: string;
  complexity: string;
  estimated_hours: number;
  status: string;
  ai_recommendation: string;
  created_at: string;
}

export default function SapScopeApp() {
  const [requirements, setRequirements] = useState<SapRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [clientCompany, setClientCompany] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sapModule, setSapModule] = useState('FI');
  const [complexity, setComplexity] = useState('Media');
  const [estimatedHours, setEstimatedHours] = useState(16);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Cargar registros desde Supabase
  const fetchRequirements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sap_requirements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequirements(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Asistente IA de análisis y estimación SAP
  const handleAiAnalyze = () => {
    if (!title && !description) return;
    setAiAnalyzing(true);

    setTimeout(() => {
      const text = `${title} ${description}`.toLowerCase();
      let detectedModule = 'BTP';
      let suggestedHours = 20;
      let detectedComplexity = 'Media';
      let recommendation =
        'Evaluar extensión side-by-side en SAP BTP mediante servicios OData estándar.';

      if (text.includes('factura') || text.includes('contab') || text.includes('banco') || text.includes('sunat') || text.includes('pago')) {
        detectedModule = 'FI';
        suggestedHours = 32;
        detectedComplexity = 'Alta';
        recommendation =
          'Revisar parametrización FI-GL/AP y validar BAdIs estándar antes de crear desarrollo Z.';
      } else if (text.includes('compra') || text.includes('inventario') || text.includes('almacen') || text.includes('stock') || text.includes('pedido')) {
        detectedModule = 'MM';
        suggestedHours = 24;
        detectedComplexity = 'Media';
        recommendation =
          'Configurar estrategias de liberación en SPRO y validar movimientos de mercancía (MIGO).';
      } else if (text.includes('venta') || text.includes('cliente') || text.includes('despacho') || text.includes('precio')) {
        detectedModule = 'SD';
        suggestedHours = 24;
        detectedComplexity = 'Media';
        recommendation =
          'Ajustar esquema de cálculo de precios (V/08) y validar flujo de entrega y facturación.';
      } else if (text.includes('reporte') || text.includes('programa') || text.includes('interfaz') || text.includes('abap') || text.includes('api')) {
        detectedModule = 'ABAP';
        suggestedHours = 40;
        detectedComplexity = 'Alta';
        recommendation =
          'Aplicar Clean Core: priorizar CDS Views y RAP antes que reportes clásicos ABAP.';
      }

      setSapModule(detectedModule);
      setEstimatedHours(suggestedHours);
      setComplexity(detectedComplexity);
      setAiRecommendation(recommendation);
      setAiAnalyzing(false);
    }, 500);
  };

  // Crear nuevo registro (CREATE)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany.trim() || !title.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('sap_requirements').insert([
      {
        client_company: clientCompany,
        title,
        description,
        sap_module: sapModule,
        complexity,
        estimated_hours: Number(estimatedHours),
        status: 'Pendiente',
        ai_recommendation:
          aiRecommendation || 'Pendiente de revisión técnica de arquitectura SAP.',
      },
    ]);

    if (!error) {
      setClientCompany('');
      setTitle('');
      setDescription('');
      setAiRecommendation('');
      setEstimatedHours(16);
      await fetchRequirements();
    }
    setSubmitting(false);
  };

  // Actualizar estado (UPDATE)
  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('sap_requirements')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setRequirements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  };

  // Actualizar horas estimadas (UPDATE)
  const handleHoursUpdate = async (id: string, newHours: number) => {
    if (newHours < 1) return;
    const { error } = await supabase
      .from('sap_requirements')
      .update({ estimated_hours: newHours })
      .eq('id', id);

    if (!error) {
      setRequirements((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, estimated_hours: newHours } : item
        )
      );
    }
  };

  // Eliminar registro (DELETE)
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sap_requirements').delete().eq('id', id);
    if (!error) {
      setRequirements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Métricas KPI
  const totalHours = requirements.reduce((acc, r) => acc + r.estimated_hours, 0);
  const approvedCount = requirements.filter((r) => r.status === 'Aprobado').length;

  const filteredRequirements = requirements.filter((req) => {
    const matchesStatus = filterStatus === 'Todos' || req.status === filterStatus;
    const matchesSearch =
      req.client_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.sap_module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header / Mini Landing B2B */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                B2B Micro-SaaS
              </span>
              <span className="text-slate-400 text-xs">Powered by UPPERSAP Innovation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">
              SAPScope <span className="text-blue-400">AI</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Plataforma de levantamiento, clasificación con IA y estimación de requerimientos SAP para consultoras B2B.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Requerimientos</p>
              <p className="text-xl font-bold text-white">{requirements.length}</p>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Horas Totales</p>
              <p className="text-xl font-bold text-blue-400">{totalHours}h</p>
            </div>
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400">Aprobados</p>
              <p className="text-xl font-bold text-emerald-400">{approvedCount}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulario de Registro + Asistente IA (4 columnas) */}
        <section className="lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-4">
            <Plus className="w-5 h-5 text-blue-600" />
            Nuevo Requerimiento Funcional
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Empresa Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Corporación Lindley S.A."
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Título del Requerimiento *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Interfaz de facturación electrónica SUNAT"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Descripción del Problema Empresarial
              </label>
              <textarea
                rows={3}
                placeholder="Describe el proceso actual y lo que el cliente necesita resolver en SAP..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Botón de Asistente IA */}
            <button
              type="button"
              onClick={handleAiAnalyze}
              disabled={aiAnalyzing || (!title && !description)}
              className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {aiAnalyzing
                ? 'Analizando alcance con IA...'
                : 'Autocompletar Módulo y Horas con IA'}
            </button>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Módulo SAP
                </label>
                <select
                  value={sapModule}
                  onChange={(e) => setSapModule(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="FI">FI (Finanzas)</option>
                  <option value="MM">MM (Compras)</option>
                  <option value="SD">SD (Ventas)</option>
                  <option value="PP">PP (Producción)</option>
                  <option value="ABAP">ABAP / Z</option>
                  <option value="BTP">SAP BTP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Complejidad
                </label>
                <select
                  value={complexity}
                  onChange={(e) => setComplexity(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Horas Est.
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {aiRecommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <span className="font-bold flex items-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Recomendación Técnica IA:
                </span>
                {aiRecommendation}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Guardando en Base de Datos...' : 'Registrar Requerimiento'}
            </button>
          </form>
        </section>

        {/* Listado y Gestión de Registros (7 columnas) */}
        <section className="lg:col-span-7 space-y-4">
          {/* Barra de filtros */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por empresa, título o módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Descartado">Descartado</option>
              </select>

              <button
                onClick={fetchRequirements}
                title="Refrescar datos"
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de tarjetas */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Cargando requerimientos desde PostgreSQL...
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
              No hay requerimientos registrados con estos filtros.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequirements.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {req.client_company}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          <Layers className="w-3 h-3" />
                          SAP {req.sap_module}
                        </span>
                        <span className="text-xs text-slate-500">
                          Complejidad: <strong>{req.complexity}</strong>
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{req.title}</h3>
                    </div>

                    <button
                      onClick={() => handleDelete(req.id)}
                      title="Eliminar registro"
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {req.description && (
                    <p className="text-sm text-slate-600 mt-2">{req.description}</p>
                  )}

                  {req.ai_recommendation && (
                    <div className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700">
                      <span className="font-semibold text-indigo-700">Análisis Técnico: </span>
                      {req.ai_recommendation}
                    </div>
                  )}

                  {/* Controles de Edición de Estado y Horas */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Estado:</span>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                          req.status === 'Aprobado'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'En Revisión'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : req.status === 'Descartado'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Revisión">En Revisión</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Descartado">Descartado</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Horas:</span>
                      <input
                        type="number"
                        min={1}
                        value={req.estimated_hours}
                        onChange={(e) =>
                          handleHoursUpdate(req.id, Number(e.target.value))
                        }
                        className="w-16 px-2 py-0.5 text-xs font-bold border border-slate-300 rounded text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}