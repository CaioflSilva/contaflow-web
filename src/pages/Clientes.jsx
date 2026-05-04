import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#4f46e5)',
  'linear-gradient(135deg,#0891b2,#0284c7)',
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#b45309,#d97706)',
  'linear-gradient(135deg,#9d174d,#ec4899)',
];

const getInitials = (nome) => nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [obrigacoes, setObrigacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formEdicao, setFormEdicao] = useState({});
  const [form, setForm] = useState({
    nome: '', cpfCnpj: '', tipo: 'PJ', regimeTributario: 'SIMPLES_NACIONAL',
    email: '', telefone: '', cidade: '', estado: 'PE', cep: '',
    logradouro: '', numero: '', complemento: '', bairro: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [clRes, obRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/obrigacoes'),
      ]);
      setClientes(clRes.data.content || []);
      setObrigacoes(obRes.data.content || []);
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
      setForm({ nome: '', cpfCnpj: '', tipo: 'PJ', regimeTributario: 'SIMPLES_NACIONAL', email: '', telefone: '', cidade: '', estado: 'PE', cep: '', logradouro: '', numero: '', complemento: '', bairro: '' });
      carregarDados();
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
      setClienteSelecionado(null);
      carregarDados();
    } catch (e) {
      alert('Erro ao inativar cliente');
    }
  };

  const handleEditar = async () => {
    setSalvando(true);
    setErro('');
    try {
      const res = await api.put(`/clientes/${clienteSelecionado.id}`, {
        ...formEdicao,
        cpfCnpj: clienteSelecionado.cpfCnpj,
        tipo: clienteSelecionado.tipo,
      });
      setClienteSelecionado(res.data);
      setEditando(false);
      carregarDados();
    } catch (e) {
      setErro(e.response?.data?.erro || 'Erro ao editar cliente');
    } finally {
      setSalvando(false);
    }
  };

  const getObrigacoesCliente = (clienteId) =>
    obrigacoes.filter(o => o.clienteId === clienteId);

  const getDias = (prazo) => Math.ceil((new Date(prazo) - new Date()) / 86400000);

  const getStatusOb = (ob) => {
    if (ob.status === 'ENTREGUE') return { label: 'Entregue', color: C.green };
    if (ob.atrasada) return { label: 'Atrasada', color: C.red };
    const dias = getDias(ob.prazo);
    if (dias <= 7) return { label: `${dias}d — Urgente`, color: C.yellow };
    return { label: `${dias}d restantes`, color: C.accent };
  };

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>
            {clienteSelecionado ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span onClick={() => { setClienteSelecionado(null); setEditando(false); }} style={{ cursor: 'pointer', color: C.muted, fontSize: '14px' }}>← Clientes</span>
                <span style={{ color: C.muted }}>/</span>
                {clienteSelecionado.nome}
              </span>
            ) : 'Clientes'}
          </div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
            {clienteSelecionado ? `${clienteSelecionado.regimeTributario?.replace('_', ' ')} · ${clienteSelecionado.tipo}` : `${clientes.length} clientes cadastrados`}
          </div>
        </div>
        {!clienteSelecionado && (
          <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
            + Novo Cliente
          </button>
        )}
        {clienteSelecionado && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => {
              if (!editando) {
                setFormEdicao({
                  nome: clienteSelecionado.nome,
                  email: clienteSelecionado.email || '',
                  telefone: clienteSelecionado.telefone || '',
                  regimeTributario: clienteSelecionado.regimeTributario,
                  cidade: clienteSelecionado.cidade || '',
                  estado: clienteSelecionado.estado || '',
                  cep: clienteSelecionado.cep || '',
                  logradouro: clienteSelecionado.logradouro || '',
                  numero: clienteSelecionado.numero || '',
                  complemento: clienteSelecionado.complemento || '',
                  bairro: clienteSelecionado.bairro || '',
                });
              }
              setEditando(!editando);
            }} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.border}`, background: editando ? C.accent : 'transparent', color: editando ? '#fff' : C.text, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              {editando ? '✕ Cancelar' : '✏️ Editar'}
            </button>
            <button onClick={() => handleInativar(clienteSelecionado.id)} style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${C.red}`, background: 'transparent', color: C.red, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              Inativar
            </button>
          </div>
        )}
      </div>

      {/* Detalhe do cliente */}
      {clienteSelecionado ? (
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

            {/* Dados do cliente */}
            <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: avatarColors[clientes.indexOf(clienteSelecionado) % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: '#fff' }}>
                  {getInitials(clienteSelecionado.nome)}
                </div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>{clienteSelecionado.nome}</div>
                  <div style={{ fontSize: '12px', color: C.muted }}>{clienteSelecionado.cpfCnpj}</div>
                </div>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: clienteSelecionado.ativo ? '#10b98122' : '#ef444422', color: clienteSelecionado.ativo ? C.green : C.red }}>
                  {clienteSelecionado.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div style={{ padding: '20px' }}>
                {editando ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      ['Nome', 'nome', 'text'],
                      ['E-mail', 'email', 'email'],
                      ['Telefone', 'telefone', 'text'],
                      ['CEP', 'cep', 'text'],
                      ['Logradouro', 'logradouro', 'text'],
                      ['Número', 'numero', 'text'],
                      ['Complemento', 'complemento', 'text'],
                      ['Bairro', 'bairro', 'text'],
                      ['Cidade', 'cidade', 'text'],
                      ['Estado', 'estado', 'text'],
                    ].map(([label, field, type]) => (
                      <div key={field}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: C.muted, marginBottom: '4px', display: 'block' }}>{label}</label>
                        <input type={type} value={formEdicao[field] || ''} onChange={e => setFormEdicao({ ...formEdicao, [field]: e.target.value })}
                          style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                      </div>
                    ))}
                    {erro && <p style={{ color: C.red, fontSize: '13px' }}>{erro}</p>}
                    <button onClick={handleEditar} disabled={salvando} style={{ padding: '10px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                      {salvando ? 'Salvando...' : '✓ Salvar Alterações'}
                    </button>
                  </div>
                ) : (
                  <>
                    {[
                      { label: 'Tipo', value: clienteSelecionado.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física' },
                      { label: 'Regime Tributário', value: clienteSelecionado.regimeTributario?.replace('_', ' ') },
                      { label: 'E-mail', value: clienteSelecionado.email || '—' },
                      { label: 'Telefone', value: clienteSelecionado.telefone || '—' },
                      { label: 'Cidade / Estado', value: clienteSelecionado.cidade ? `${clienteSelecionado.cidade} / ${clienteSelecionado.estado}` : '—' },
                      { label: 'CEP', value: clienteSelecionado.cep || '—' },
                      { label: 'Endereço', value: clienteSelecionado.logradouro ? `${clienteSelecionado.logradouro}, ${clienteSelecionado.numero}${clienteSelecionado.complemento ? ` - ${clienteSelecionado.complemento}` : ''}` : '—' },
                      { label: 'Bairro', value: clienteSelecionado.bairro || '—' },
                      { label: 'Cadastrado em', value: new Date(clienteSelecionado.criadoEm).toLocaleDateString('pt-BR') },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: '12px', color: C.muted, fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: '13px', color: C.text, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Resumo de obrigações */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {(() => {
                  const obs = getObrigacoesCliente(clienteSelecionado.id);
                  const entregues = obs.filter(o => o.status === 'ENTREGUE').length;
                  const atrasadas = obs.filter(o => o.atrasada).length;
                  const pendentes = obs.filter(o => o.status === 'PENDENTE' && !o.atrasada).length;
                  return [
                    { label: 'Entregues', value: entregues, color: C.green },
                    { label: 'Pendentes', value: pendentes, color: C.yellow },
                    { label: 'Atrasadas', value: atrasadas, color: C.red },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ background: C.surface, borderRadius: '10px', border: `1px solid ${C.border}`, padding: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: kpi.color }} />
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                      <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>{kpi.label}</div>
                    </div>
                  ));
                })()}
              </div>

              <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text }}>Obrigações</div>
                </div>
                {getObrigacoesCliente(clienteSelecionado.id).length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                    Nenhuma obrigação cadastrada
                  </div>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {getObrigacoesCliente(clienteSelecionado.id)
                      .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
                      .map(ob => {
                        const status = getStatusOb(ob);
                        return (
                          <div key={ob.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: `${C.accent}11`, color: C.accent, border: `1px solid ${C.accent}33` }}>
                                {ob.tipo}
                              </span>
                              <div>
                                <div style={{ fontSize: '12px', color: C.text, fontWeight: 500 }}>Prazo: {ob.prazo}</div>
                                <div style={{ fontSize: '11px', color: C.muted }}>Competência: {ob.competencia}</div>
                              </div>
                            </div>
                            <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: `${status.color}22`, color: status.color }}>
                              {status.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
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
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '12px 20px', background: C.surface2, fontSize: '11px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <div>Cliente</div><div>CNPJ/CPF</div><div>Regime</div><div>Obrigações</div><div>Status</div>
              </div>
              {clientes.map((cliente, i) => {
                const obsCliente = getObrigacoesCliente(cliente.id);
                const atrasadas = obsCliente.filter(o => o.atrasada).length;
                return (
                  <div key={cliente.id} onClick={() => setClienteSelecionado(cliente)}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '16px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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
                    <div style={{ fontSize: '12px', color: C.muted }}>{cliente.regimeTributario?.replace('_', ' ')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{obsCliente.length}</span>
                      {atrasadas > 0 && <span style={{ background: '#ef444422', color: C.red, padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>{atrasadas} atrasada{atrasadas > 1 ? 's' : ''}</span>}
                    </div>
                    <div>
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: cliente.ativo ? '#10b98122' : '#ef444422', color: cliente.ativo ? C.green : C.red }}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal novo cliente */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '16px', width: '560px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '22px 26px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: C.surface, zIndex: 1 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>Novo Cliente</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: C.muted }}>✕</button>
            </div>
            <div style={{ padding: '24px 26px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Dados Principais</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Nome / Razão Social *</label>
                  <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome da empresa ou pessoa"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>CNPJ / CPF *</label>
                  <input value={form.cpfCnpj} onChange={e => setForm({ ...form, cpfCnpj: e.target.value })} placeholder="00.000.000/0001-00"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2 }}>
                    <option value="PJ">Pessoa Jurídica</option>
                    <option value="PF">Pessoa Física</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
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

              <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Contato</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>E-mail</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com.br"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(81) 99999-9999"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Endereço</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>CEP</label>
                  <input value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} placeholder="00000-000"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Bairro</label>
                  <input value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} placeholder="Bairro"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Logradouro</label>
                  <input value={form.logradouro} onChange={e => setForm({ ...form, logradouro: e.target.value })} placeholder="Rua, Avenida..."
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Número</label>
                  <input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value })} placeholder="123"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Complemento</label>
                  <input value={form.complemento} onChange={e => setForm({ ...form, complemento: e.target.value })} placeholder="Sala, Andar..."
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Cidade</label>
                  <input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Recife"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block' }}>Estado</label>
                  <input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} placeholder="PE"
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none', background: C.surface2, boxSizing: 'border-box' }} />
                </div>
              </div>
              {erro && <p style={{ color: C.red, fontSize: '13px', marginTop: '12px' }}>{erro}</p>}
            </div>
            <div style={{ padding: '16px 26px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: '10px', position: 'sticky', bottom: 0, background: C.surface }}>
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