import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

export default function Clientes({ onBack }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    nome: '', cpfCnpj: '', tipo: 'PJ', regimeTributario: 'SIMPLES_NACIONAL',
    email: '', telefone: '', cidade: '', estado: 'PE',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarClientes(); }, []);

  const carregarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.content || []);
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
      await api.post('/clientes', form);
      setShowModal(false);
      setForm({ nome: '', cpfCnpj: '', tipo: 'PJ', regimeTributario: 'SIMPLES_NACIONAL', email: '', telefone: '', cidade: '', estado: 'PE' });
      carregarClientes();
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao salvar cliente');
    } finally {
      setSalvando(false);
    }
  };

  const handleInativar = async (id) => {
    if (!confirm('Deseja inativar este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      carregarClientes();
    } catch (e) {
      alert('Erro ao inativar cliente');
    }
  };

  const avatarColors = [
    'linear-gradient(135deg,#6366f1,#4f46e5)',
    'linear-gradient(135deg,#0891b2,#0284c7)',
    'linear-gradient(135deg,#059669,#10b981)',
    'linear-gradient(135deg,#b45309,#d97706)',
    'linear-gradient(135deg,#9d174d,#ec4899)',
  ];

  const getInitials = (nome) => nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Clientes</div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{clientes.length} clientes cadastrados</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
          + Novo Cliente
        </button>
      </div>

      {/* Lista */}
      <div style={{ padding: '24px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>Carregando...</div>
        ) : clientes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: C.text }}>Nenhum cliente ainda</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Clique em "+ Novo Cliente" para começar</div>
          </div>
        ) : (
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', padding: '12px 20px', background: C.surface2, fontSize: '11px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Cliente</div><div>CNPJ/CPF</div><div>Tipo</div><div>Regime</div><div>Status</div><div>Ações</div>
            </div>
            {clientes.map((cliente, i) => (
              <div key={cliente.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 100px', padding: '16px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', color: '#fff', flexShrink: 0 }}>
                    {getInitials(cliente.nome)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: C.text }}>{cliente.nome}</div>
                    <div style={{ fontSize: '11px', color: C.muted }}>{cliente.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: C.text }}>{cliente.cpfCnpj}</div>
                <div style={{ fontSize: '13px', color: C.text }}>{cliente.tipo}</div>
                <div style={{ fontSize: '12px', color: C.muted }}>{cliente.regimeTributario?.replace('_', ' ')}</div>
                <div>
                  <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: cliente.ativo ? '#10b98122' : '#ef444422', color: cliente.ativo ? C.green : C.red }}>
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleInativar(cliente.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: C.red, fontSize: '11px', cursor: 'pointer' }}>
                    Inativar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '16px', width: '520px', maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '22px 26px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>Novo Cliente</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: C.muted }}>✕</button>
            </div>
            <div style={{ padding: '24px 26px' }}>
              {[
                ['Nome / Razão Social', 'nome', 'text', 'Nome da empresa'],
                ['CNPJ / CPF', 'cpfCnpj', 'text', '00.000.000/0001-00'],
                ['E-mail', 'email', 'email', 'contato@empresa.com.br'],
                ['Telefone', 'telefone', 'text', '(81) 99999-9999'],
                ['Cidade', 'cidade', 'text', 'Recife'],
              ].map(([label, field, type, ph]) => (
                <div key={field} style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>{label}</label>
                  <input type={type} placeholder={ph} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', boxSizing: 'border-box', background: C.surface2 }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }}>
                    <option value="PJ">Pessoa Jurídica</option>
                    <option value="PF">Pessoa Física</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Regime Tributário</label>
                  <select value={form.regimeTributario} onChange={e => setForm({ ...form, regimeTributario: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }}>
                    <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                    <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                    <option value="LUCRO_REAL">Lucro Real</option>
                    <option value="MEI">MEI</option>
                  </select>
                </div>
              </div>
              {erro && <p style={{ color: C.red, fontSize: '13px', marginBottom: '12px' }}>{erro}</p>}
            </div>
            <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                {salvando ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}