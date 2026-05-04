import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Clientes from './Clientes';
import Obrigacoes from './Obrigacoes';
import Alertas from './Alertas';
import Calendario from './Calendario';
import Relatorios from './Relatorios';
import Configuracoes from './Configuracoes';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

const Badge = ({ children, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: `${color}22`, color, border: `1px solid ${color}33`, letterSpacing: '0.3px' }}>
    {children}
  </span>
);

const RiskDot = ({ level }) => {
  const colors = { critical: C.red, warning: C.yellow, ok: C.green };
  const color = colors[level];
  return <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, marginRight: '6px' }} />;
};

export default function Dashboard() {
  const [clientes, setClientes] = useState([]);
  const [obrigacoesVencendo, setObrigacoesVencendo] = useState([]);
  const [obrigacoesAtrasadas, setObrigacoesAtrasadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const navigate = useNavigate();

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    if (menu === 'dashboard') carregarDados();
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login'); return; }
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [clientesRes, vencendoRes, atrasadasRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/obrigacoes/vencendo?dias=30'),
        api.get('/obrigacoes/atrasadas'),
      ]);
      setClientes(clientesRes.data.content || []);
      setObrigacoesVencendo(vencendoRes.data || []);
      setObrigacoesAtrasadas(atrasadasRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const getDias = (prazo) => Math.ceil((new Date(prazo) - new Date()) / 86400000);
  const getRiskLevel = (ob) => {
    const dias = getDias(ob.prazo);
    if (dias < 0) return 'critical';
    if (dias <= 7) return 'warning';
    return 'ok';
  };
  const getClienteInitials = (nome) => nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const avatarGradients = [
    'linear-gradient(135deg,#7c3aed,#4f46e5)',
    'linear-gradient(135deg,#0891b2,#0284c7)',
    'linear-gradient(135deg,#059669,#10b981)',
    'linear-gradient(135deg,#b45309,#d97706)',
    'linear-gradient(135deg,#9d174d,#ec4899)',
  ];
  const vencendoHoje = obrigacoesVencendo.filter(o => getDias(o.prazo) <= 1);
  const clientesRisco = clientes.filter(c =>
    obrigacoesAtrasadas.some(o => o.clienteId === c.id) ||
    obrigacoesVencendo.some(o => o.clienteId === c.id && getDias(o.prazo) <= 3)
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, fontFamily: "'DM Mono', monospace" }}>
      <div style={{ textAlign: 'center', color: C.accent }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
        <div style={{ fontSize: '12px', letterSpacing: '2px' }}>CARREGANDO CONTAFLOW...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Mono', monospace" }}>

      {/* SIDEBAR */}
      <aside style={{ width: '220px', minHeight: '100vh', background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: C.text }}>
            Conta<span style={{ color: C.accent }}>Flow</span>
          </div>
          <div style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Gestão Contábil Inteligente</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {[
            { section: '📁 Gestão', items: [{ id: 'dashboard', icon: '⬛', label: 'Visão Geral' }, { id: 'clientes', icon: '👥', label: 'Clientes' }, { id: 'obrigacoes', icon: '📋', label: 'Obrigações' }] },
            { section: '📊 Monitoramento', items: [{ id: 'alertas', icon: '🔔', label: 'Alertas', badge: obrigacoesAtrasadas.length }, { id: 'calendario', icon: '📅', label: 'Calendário Fiscal' }, { id: 'relatorios', icon: '📊', label: 'Relatórios' }] },
            { section: '🤖 Inteligência', items: [{ id: 'ia', icon: '✨', label: 'IA Tributária', badge: 'PRO' }, { id: 'config', icon: '⚙️', label: 'Configurações' }] },
          ].map(({ section, items }) => (
            <div key={section}>
              <div style={{ fontSize: '9px', color: C.muted, padding: '16px 20px 6px', letterSpacing: '1.5px', textTransform: 'uppercase', opacity: 0.6 }}>{section}</div>
              {items.map(item => (
                <div key={item.id} onClick={() => handleMenuChange(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 20px', fontSize: '12px', color: activeMenu === item.id ? C.accent : C.muted, cursor: 'pointer', borderLeft: `2px solid ${activeMenu === item.id ? C.accent : 'transparent'}`, background: activeMenu === item.id ? `${C.accent}11` : 'transparent', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: '13px' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && typeof item.badge === 'number' && item.badge > 0 && (
                    <span style={{ background: C.red, color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '9px', fontWeight: 700 }}>{item.badge}</span>
                  )}
                  {item.badge === 'PRO' && (
                    <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', borderRadius: '4px', padding: '1px 5px', fontSize: '8px', fontWeight: 700 }}>PRO</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', color: '#fff' }}>Plano Pro</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '2px' }}>{clientes.length} / 100 clientes</div>
            <div style={{ marginTop: '8px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${(clientes.length / 100) * 100}%`, background: '#fff', borderRadius: '2px' }} />
            </div>
          </div>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: C.muted, fontSize: '11px', padding: '6px 0' }}>
            🚪 Sair da conta
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: '220px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {activeMenu === 'clientes' && <Clientes />}
        {activeMenu === 'obrigacoes' && <Obrigacoes />}
        {activeMenu === 'alertas' && <Alertas />}
        {activeMenu === 'calendario' && <Calendario />}
        {activeMenu === 'relatorios' && <Relatorios />}
        {activeMenu === 'config' && <Configuracoes />}
        {!['clientes','obrigacoes','alertas','calendario','relatorios','config'].includes(activeMenu) && <>

        {/* Topbar */}
        <div style={{ padding: '18px 32px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Visão Geral Fiscal</div>
            <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>Resumo inteligente de obrigações e riscos fiscais</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.green }}>
              <div style={{ width: '6px', height: '6px', background: C.green, borderRadius: '50%', boxShadow: `0 0 6px ${C.green}` }} /> Ao vivo
            </div>
            <div style={{ fontSize: '11px', color: C.muted, background: C.surface2, padding: '6px 12px', borderRadius: '6px', border: `1px solid ${C.border}` }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '12px', color: '#fff' }}>C</div>
            <button onClick={() => handleMenuChange('clientes')} style={{ padding: '8px 18px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', border: 'none', background: C.accent, color: '#fff', fontWeight: 600 }}>
              + Novo Cliente
            </button>
          </div>
        </div>

        <div style={{ padding: '28px 32px', flex: 1 }}>

          {/* CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 1.2fr', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.3)`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: C.red }} />
              <div style={{ fontSize: '10px', color: C.red, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <RiskDot level="critical" /> Crítico
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, color: C.red }}>{obrigacoesAtrasadas.length}</div>
              <div style={{ fontSize: '12px', color: C.text, marginTop: '4px' }}>obrigações atrasadas</div>
              <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>Risco de multas e penalidades</div>
            </div>

            <div style={{ background: 'rgba(245,158,11,0.06)', border: `1px solid rgba(245,158,11,0.3)`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: C.yellow }} />
              <div style={{ fontSize: '10px', color: C.yellow, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <RiskDot level="warning" /> Atenção
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, color: C.yellow }}>{obrigacoesVencendo.length}</div>
              <div style={{ fontSize: '12px', color: C.text, marginTop: '4px' }}>vencem nos próximos 30 dias</div>
              <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{vencendoHoje.length} vencem hoje ou amanhã</div>
            </div>

            <div style={{ background: 'rgba(16,185,129,0.06)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: C.green }} />
              <div style={{ fontSize: '10px', color: C.green, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <RiskDot level="ok" /> Em dia
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', fontWeight: 800, color: C.green }}>{clientes.length}</div>
              <div style={{ fontSize: '12px', color: C.text, marginTop: '4px' }}>clientes cadastrados</div>
              <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{Math.max(0, clientes.length - clientesRisco.length)} sem pendências</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.06))', border: `1px solid rgba(124,58,237,0.4)`, borderRadius: '12px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#7c3aed,#4f46e5)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: C.accent2, letterSpacing: '1.5px', textTransform: 'uppercase' }}>✨ IA Tributária</div>
                <span style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '8px', fontWeight: 700 }}>PRO</span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: C.accent2 }}>R$ 2.300</div>
              <div style={{ fontSize: '11px', color: C.text, marginTop: '4px' }}>economia estimada</div>
              <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>em otimização tributária</div>
              <button style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', border: `1px solid rgba(124,58,237,0.5)`, background: 'rgba(124,58,237,0.15)', color: C.accent2 }}>
                Ver análise →
              </button>
            </div>
          </div>

          {/* MAIN GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: C.text }}>Obrigações — Próximos 30 dias</div>
                  <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>Ordenadas por urgência e risco</div>
                </div>
                <span onClick={() => handleMenuChange('obrigacoes')} style={{ fontSize: '10px', color: C.accent, cursor: 'pointer' }}>Ver todas →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 20px', background: C.surface2, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: C.muted }}>
                <div>Cliente</div><div>Obrigação</div><div>Prazo</div><div>Status</div>
              </div>
              {[...obrigacoesAtrasadas, ...obrigacoesVencendo].length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: C.green }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontSize: '13px' }}>Nenhuma obrigação pendente!</div>
                </div>
              ) : (
                [...obrigacoesAtrasadas, ...obrigacoesVencendo].map((ob) => {
                  const dias = getDias(ob.prazo);
                  const risk = getRiskLevel(ob);
                  const riskColors = { critical: C.red, warning: C.yellow, ok: C.green };
                  const cliente = clientes.find(c => c.id === ob.clienteId);
                  return (
                    <div key={ob.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', fontSize: '11px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <RiskDot level={risk} />
                          <span style={{ fontWeight: 600, color: C.text }}>{cliente?.nome || 'Cliente'}</span>
                        </div>
                        <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px', paddingLeft: '14px' }}>{cliente?.cpfCnpj}</div>
                      </div>
                      <div>
                        <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, background: `${C.accent}11`, color: C.accent, border: `1px solid ${C.accent}33` }}>
                          {ob.tipo}
                        </span>
                      </div>
                      <div style={{ color: riskColors[risk], fontWeight: 600 }}>
                        {dias < 0 ? `${Math.abs(dias)}d atraso` : dias === 0 ? 'Hoje!' : dias === 1 ? 'Amanhã' : `${dias} dias`}
                      </div>
                      <div>
                        <Badge color={risk === 'critical' ? C.red : risk === 'warning' ? C.yellow : C.green}>
                          {ob.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Alertas */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: C.text }}>🔔 Alertas Ativos</div>
                <span onClick={() => handleMenuChange('alertas')} style={{ fontSize: '10px', color: C.accent, cursor: 'pointer' }}>Ver todos →</span>
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {obrigacoesAtrasadas.map((ob) => {
                  const cliente = clientes.find(c => c.id === ob.clienteId);
                  return (
                    <div key={ob.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, boxShadow: `0 0 8px ${C.red}`, marginTop: '5px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '11px', lineHeight: 1.6, color: C.text }}><strong>{ob.tipo}</strong> de <strong>{cliente?.nome}</strong> está atrasado</div>
                        <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px' }}>Prazo: {ob.prazo} · Alerta enviado ✓</div>
                      </div>
                    </div>
                  );
                })}
                {obrigacoesVencendo.map((ob) => {
                  const cliente = clientes.find(c => c.id === ob.clienteId);
                  const dias = getDias(ob.prazo);
                  return (
                    <div key={ob.id} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.yellow, boxShadow: `0 0 8px ${C.yellow}`, marginTop: '5px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '11px', lineHeight: 1.6, color: C.text }}><strong>{ob.tipo}</strong> de <strong>{cliente?.nome}</strong> vence em {dias}d</div>
                        <div style={{ fontSize: '10px', color: C.muted, marginTop: '3px' }}>Prazo: {ob.prazo} · E-mail enviado ✓</div>
                      </div>
                    </div>
                  );
                })}
                {obrigacoesAtrasadas.length === 0 && obrigacoesVencendo.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: C.green, fontSize: '11px' }}>✅ Nenhum alerta crítico!</div>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: C.text }}>Clientes</div>
                  <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px' }}>{clientesRisco.length} com pendências</div>
                </div>
                <span onClick={() => handleMenuChange('clientes')} style={{ fontSize: '10px', color: C.accent, cursor: 'pointer' }}>Ver todos →</span>
              </div>
              {clientes.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '11px' }}>Nenhum cliente cadastrado</div>
              ) : (
                clientes.map((cliente, i) => {
                  const atrasado = obrigacoesAtrasadas.some(o => o.clienteId === cliente.id);
                  const vencendoLogo = obrigacoesVencendo.some(o => o.clienteId === cliente.id && getDias(o.prazo) <= 3);
                  const vencendo = obrigacoesVencendo.some(o => o.clienteId === cliente.id);
                  const risk = atrasado ? 'critical' : vencendoLogo ? 'warning' : vencendo ? 'warning' : 'ok';
                  const riskLabel = atrasado ? '⚠ Atrasado' : vencendoLogo ? '⚡ Urgente' : vencendo ? '⏳ Vencendo' : '✓ Em dia';
                  const riskColor = { critical: C.red, warning: C.yellow, ok: C.green }[risk];
                  return (
                    <div key={cliente.id} onClick={() => handleMenuChange('clientes')} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: avatarGradients[i % avatarGradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '11px', color: '#fff', flexShrink: 0 }}>
                          {getClienteInitials(cliente.nome)}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{cliente.nome}</div>
                          <div style={{ fontSize: '10px', color: C.muted }}>{cliente.regimeTributario?.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <Badge color={riskColor}>{riskLabel}</Badge>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', color: C.text }}>Obrigações por Mês</div>
                  <div style={{ fontSize: '10px', color: C.red, marginTop: '2px' }}>↑ +18% em atraso vs mês anterior</div>
                </div>
                <span style={{ fontSize: '10px', color: C.muted }}>2026</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', marginBottom: '12px' }}>
                  {[
                    { mes: 'Jan', g: 60, y: 15, r: 5 },
                    { mes: 'Fev', g: 55, y: 20, r: 8 },
                    { mes: 'Mar', g: 70, y: 18, r: 3, pico: true },
                    { mes: 'Abr', g: 75, y: 12, r: 2 },
                    { mes: 'Mai', g: 62, y: 22, r: 6 },
                    { mes: 'Jun', g: 30, y: 40, r: 0, futuro: true },
                  ].map(({ mes, g, y, r, pico, futuro }) => (
                    <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      {pico && <div style={{ fontSize: '8px', color: C.muted }}>Pico</div>}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%', opacity: futuro ? 0.35 : 1 }}>
                        <div style={{ flex: 1, height: `${g}%`, background: C.green, borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
                        <div style={{ flex: 1, height: `${y}%`, background: C.yellow, borderRadius: '3px 3px 0 0' }} />
                        {r > 0 && <div style={{ flex: 1, height: `${r}%`, background: C.red, borderRadius: '3px 3px 0 0' }} />}
                      </div>
                      <div style={{ fontSize: '9px', color: C.muted }}>{mes}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  {[['Entregues', C.green], ['Pendentes', C.yellow], ['Atrasadas', C.red]].map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: C.muted }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />{label}
                    </div>
                  ))}
                </div>
                <div style={{ paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>Distribuição por Regime</div>
                  {[['Simples Nacional', 62, C.accent], ['Lucro Presumido', 28, C.accent2], ['Lucro Real', 10, C.yellow]].map(([label, pct, color]) => (
                    <div key={label} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '5px', color: C.text }}>
                        <span>{label}</span><span style={{ color, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div style={{ height: '4px', background: C.surface2, borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        </>}
      </main>
    </div>
  );
}