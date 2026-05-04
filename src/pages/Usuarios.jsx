import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

const papelColors = {
  ADMIN: { bg: '#6366f122', color: '#6366f1' },
  CONTADOR: { bg: '#10b98122', color: '#10b981' },
  ASSISTENTE: { bg: '#f59e0b22', color: '#f59e0b' },
};

const papelLabels = {
  ADMIN: 'Administrador',
  CONTADOR: 'Contador',
  ASSISTENTE: 'Assistente',
};

const getInitials = (nome) => nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#0891b2,#0284c7)',
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#b45309,#d97706)',
  'linear-gradient(135deg,#9d174d,#ec4899)',
];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [form, setForm] = useState({
    nome: '', email: '', senha: '', papel: 'CONTADOR',
  });

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!form.nome || !form.email || !form.senha) {
      setErro('Preencha todos os campos');
      return;
    }
    if (form.senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await api.post('/usuarios', form);
      setShowModal(false);
      setForm({ nome: '', email: '', senha: '', papel: 'CONTADOR' });
      setSucesso('Usuário criado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
      carregarUsuarios();
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao criar usuário');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id, nome) => {
    if (!confirm(`Deseja remover ${nome} do escritório?`)) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setSucesso('Usuário removido com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
      carregarUsuarios();
    } catch (e) {
      alert('Erro ao remover usuário');
    }
  };

  const inputStyle = {
    width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none',
    background: C.surface2, boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: 600, color: C.muted,
    marginBottom: '5px', display: 'block',
  };

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Equipe do Escritório</div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{usuarios.length} usuários cadastrados</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
          + Novo Usuário
        </button>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Feedback */}
        {sucesso && (
          <div style={{ background: '#10b98122', border: `1px solid ${C.green}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: C.green, fontSize: '13px', fontWeight: 600 }}>
            ✅ {sucesso}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>Carregando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {usuarios.map((usuario, i) => {
              const papel = papelColors[usuario.papel] || papelColors.ASSISTENTE;
              return (
                <div key={usuario.id} style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff', flexShrink: 0 }}>
                      {getInitials(usuario.nome)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{usuario.nome}</div>
                      <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{usuario.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: papel.bg, color: papel.color }}>
                      {papelLabels[usuario.papel] || usuario.papel}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: usuario.ativo ? '#10b98122' : '#ef444422', color: usuario.ativo ? C.green : C.red }}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      {usuario.papel !== 'ADMIN' && (
                        <button onClick={() => handleRemover(usuario.id, usuario.nome)} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${C.red}`, background: 'transparent', color: C.red, fontSize: '11px', cursor: 'pointer' }}>
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info papéis */}
        <div style={{ marginTop: '24px', background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text, marginBottom: '16px' }}>Papéis e Permissões</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { papel: 'ADMIN', label: 'Administrador', desc: 'Acesso total ao sistema. Pode gerenciar usuários, clientes, obrigações e configurações.', color: '#6366f1' },
              { papel: 'CONTADOR', label: 'Contador', desc: 'Pode gerenciar clientes e obrigações. Não pode gerenciar usuários ou configurações do escritório.', color: '#10b981' },
              { papel: 'ASSISTENTE', label: 'Assistente', desc: 'Acesso somente leitura. Pode visualizar clientes e obrigações mas não pode fazer alterações.', color: '#f59e0b' },
            ].map(item => (
              <div key={item.papel} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: C.surface2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: C.text }}>{item.label}</span>
                </div>
                <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '16px', width: '460px', maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '22px 26px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>Novo Usuário</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: C.muted }}>✕</button>
            </div>
            <div style={{ padding: '24px 26px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Nome *</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>E-mail *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@escritorio.com.br" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Senha *</label>
                <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo 8 caracteres" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Papel</label>
                <select value={form.papel} onChange={e => setForm({ ...form, papel: e.target.value })} style={inputStyle}>
                  <option value="CONTADOR">Contador</option>
                  <option value="ASSISTENTE">Assistente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              {erro && <p style={{ color: C.red, fontSize: '13px', marginBottom: '8px' }}>{erro}</p>}
            </div>
            <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                {salvando ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}