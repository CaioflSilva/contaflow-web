import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

const TIPOS = ['DAS', 'DCTF', 'ESOCIAL', 'REINF', 'ECF', 'SPED', 'DIRF', 'RAIS', 'PGDAS'];

export default function Obrigacoes() {
  const [obrigacoes, setObrigacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState('todas');
  const [form, setForm] = useState({
    clienteId: '', tipo: 'DAS', competencia: '', prazo: '', observacoes: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [obRes, clRes] = await Promise.all([
        api.get('/obrigacoes'),
        api.get('/clientes'),
      ]);
      setObrigacoes(obRes.data.content || []);
      setClientes(clRes.data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setErro('');
    try {
      await api.post('/obrigacoes', form);
      setShowModal(false);
      setForm({ clienteId: '', tipo: 'DAS', competencia: '', prazo: '', observacoes: '' });
      carregarDados();
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao salvar obrigação');
    } finally {
      setSalvando(false);
    }
  };

  const handleEntregar = async (id) => {
    try {
      await api.patch(`/obrigacoes/${id}/entregar`);
      carregarDados();
    } catch (e) {
      alert('Erro ao marcar como entregue');
    }
  };

  const getDias = (prazo) => Math.ceil((new Date(prazo) - new Date()) / 86400000);

  const getStatusColor = (ob) => {
    if (ob.status === 'ENTREGUE') return { bg: '#10b98122', color: C.green };
    if (ob.atrasada) return { bg: '#ef444422', color: C.red };
    const dias = getDias(ob.prazo);
    if (dias <= 7) return { bg: '#f59e0b22', color: C.yellow };
    return { bg: '#6366f122', color: C.accent };
  };

  const obrigacoesFiltradas = obrigacoes.filter(ob => {
    if (filtro === 'pendentes') return ob.status === 'PENDENTE' && !ob.atrasada;
    if (filtro === 'atrasadas') return ob.atrasada;
    if (filtro === 'entregues') return ob.status === 'ENTREGUE';
    return true;
  });

  const getClienteNome = (id) => clientes.find(c => c.id === id)?.nome || 'Cliente';

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Obrigações Fiscais</div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{obrigacoes.length} obrigações cadastradas</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
          + Nova Obrigação
        </button>
      </div>

      {/* Filtros */}
      <div style={{ padding: '16px 32px 0', display: 'flex', gap: '8px' }}>
        {[
          { id: 'todas', label: 'Todas' },
          { id: 'pendentes', label: 'Pendentes' },
          { id: 'atrasadas', label: 'Atrasadas' },
          { id: 'entregues', label: 'Entregues' },
        ].map(f => (
          <button key={f.id} onClick={() => setFiltro(f.id)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${filtro === f.id ? C.accent : C.border}`, background: filtro === f.id ? C.accent : 'transparent', color: filtro === f.id ? '#fff' : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding: '16px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>Carregando...</div>
        ) : obrigacoesFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: C.text }}>Nenhuma obrigação encontrada</div>
          </div>
        ) : (
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', padding: '12px 20px', background: C.surface2, fontSize: '11px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Cliente</div><div>Tipo</div><div>Competência</div><div>Prazo</div><div>Status</div><div>Ações</div>
            </div>
            {obrigacoesFiltradas.map((ob) => {
              const statusStyle = getStatusColor(ob);
              const dias = getDias(ob.prazo);
              return (
                <div key={ob.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', padding: '14px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: C.text }}>{getClienteNome(ob.clienteId)}</div>
                  <div>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: '#6366f122', color: C.accent, border: '1px solid #6366f133' }}>
                      {ob.tipo}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted }}>{ob.competencia}</div>
                  <div style={{ fontSize: '13px', color: ob.atrasada ? C.red : dias <= 7 ? C.yellow : C.text, fontWeight: ob.atrasada ? 700 : 500 }}>
                    {ob.prazo}
                    {ob.status !== 'ENTREGUE' && (
                      <div style={{ fontSize: '11px', color: ob.atrasada ? C.red : C.muted }}>
                        {ob.atrasada ? `${Math.abs(dias)}d atraso` : `${dias}d restantes`}
                      </div>
                    )}
                  </div>
                  <div>
                    <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                      {ob.atrasada ? 'ATRASADA' : ob.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {ob.status !== 'ENTREGUE' && (
                      <button onClick={() => handleEntregar(ob.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: C.green, color: '#fff', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
                        ✓ Entregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '16px', width: '480px', maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '22px 26px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>Nova Obrigação</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: C.muted }}>✕</button>
            </div>
            <div style={{ padding: '24px 26px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Cliente</label>
                <select value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}
                  style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Tipo de Obrigação</label>
                <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                  style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Competência</label>
                  <input type="date" value={form.competencia} onChange={e => setForm({ ...form, competencia: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Prazo</label>
                  <input type="date" value={form.prazo} onChange={e => setForm({ ...form, prazo: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={3}
                  placeholder="Observações sobre a obrigação..."
                  style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              {erro && <p style={{ color: C.red, fontSize: '13px', marginBottom: '12px' }}>{erro}</p>}
            </div>
            <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                {salvando ? 'Salvando...' : 'Salvar Obrigação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}