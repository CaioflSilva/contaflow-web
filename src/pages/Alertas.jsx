import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

export default function Alertas() {
  const [obrigacoesVencendo, setObrigacoesVencendo] = useState([]);
  const [obrigacoesAtrasadas, setObrigacoesAtrasadas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [vencendoRes, atrasadasRes, clientesRes] = await Promise.all([
        api.get('/obrigacoes/vencendo?dias=30'),
        api.get('/obrigacoes/atrasadas'),
        api.get('/clientes'),
      ]);
      setObrigacoesVencendo(vencendoRes.data || []);
      setObrigacoesAtrasadas(atrasadasRes.data || []);
      setClientes(clientesRes.data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDias = (prazo) => Math.ceil((new Date(prazo) - new Date()) / 86400000);
  const getClienteNome = (id) => clientes.find(c => c.id === id)?.nome || 'Cliente';

  const totalAlertas = obrigacoesAtrasadas.length + obrigacoesVencendo.length;

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Alertas Automáticos</div>
        <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{totalAlertas} alertas ativos</div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>Carregando...</div>
        ) : totalAlertas === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.text }}>Nenhum alerta ativo!</div>
            <div style={{ fontSize: '13px', color: C.muted, marginTop: '6px' }}>Todos os clientes estão em dia com suas obrigações.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Atrasadas */}
            {obrigacoesAtrasadas.length > 0 && (
              <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid rgba(239,68,68,0.3)`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid rgba(239,68,68,0.2)`, background: 'rgba(239,68,68,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.red, boxShadow: `0 0 8px ${C.red}` }} />
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.red }}>🚨 Obrigações Atrasadas</div>
                  <span style={{ marginLeft: 'auto', background: '#ef444422', color: C.red, padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{obrigacoesAtrasadas.length}</span>
                </div>
                {obrigacoesAtrasadas.map((ob) => {
                  const dias = Math.abs(getDias(ob.prazo));
                  return (
                    <div key={ob.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ef444422', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>⚠️</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{getClienteNome(ob.clienteId)}</div>
                          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
                            <span style={{ background: '#6366f122', color: C.accent, padding: '2px 8px', borderRadius: '4px', fontWeight: 600, marginRight: '8px' }}>{ob.tipo}</span>
                            Prazo era: {ob.prazo}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: C.red }}>{dias}d</div>
                        <div style={{ fontSize: '11px', color: C.muted }}>em atraso</div>
                        <div style={{ fontSize: '10px', color: C.green, marginTop: '4px' }}>✓ Alerta enviado</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vencendo */}
            {obrigacoesVencendo.length > 0 && (
              <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid rgba(245,158,11,0.3)`, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid rgba(245,158,11,0.2)`, background: 'rgba(245,158,11,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.yellow, boxShadow: `0 0 8px ${C.yellow}` }} />
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.yellow }}>⏰ Vencendo em breve</div>
                  <span style={{ marginLeft: 'auto', background: '#f59e0b22', color: C.yellow, padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{obrigacoesVencendo.length}</span>
                </div>
                {obrigacoesVencendo.map((ob) => {
                  const dias = getDias(ob.prazo);
                  const isUrgente = dias <= 3;
                  return (
                    <div key={ob.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isUrgente ? '#ef444422' : '#f59e0b22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          {isUrgente ? '🔴' : '🟡'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{getClienteNome(ob.clienteId)}</div>
                          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
                            <span style={{ background: '#6366f122', color: C.accent, padding: '2px 8px', borderRadius: '4px', fontWeight: 600, marginRight: '8px' }}>{ob.tipo}</span>
                            Prazo: {ob.prazo}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: isUrgente ? C.red : C.yellow }}>{dias}d</div>
                        <div style={{ fontSize: '11px', color: C.muted }}>restantes</div>
                        <div style={{ fontSize: '10px', color: C.green, marginTop: '4px' }}>✓ Alerta enviado</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* IA */}
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.04))', borderRadius: '12px', border: `1px solid rgba(124,58,237,0.3)`, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>IA Tributária — Análise automática</div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Economia estimada de <strong style={{ color: C.accent2 }}>R$ 2.300</strong> em otimização tributária identificada</div>
                </div>
                <button style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: '8px', border: `1px solid rgba(124,58,237,0.4)`, background: 'rgba(124,58,237,0.1)', color: C.accent2, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  Ver análise →
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}