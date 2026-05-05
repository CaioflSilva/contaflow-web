import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

export default function Relatorios() {
  const [clientes, setClientes] = useState([]);
  const [obrigacoes, setObrigacoes] = useState([]);
  const [obrigacoesVencendo, setObrigacoesVencendo] = useState([]);
  const [obrigacoesAtrasadas, setObrigacoesAtrasadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [clRes, obRes, vencendoRes, atrasadasRes] = await Promise.all([
        api.get('/clientes'),
        api.get('/obrigacoes'),
        api.get('/obrigacoes/vencendo?dias=30'),
        api.get('/obrigacoes/atrasadas'),
      ]);
      setClientes(clRes.data.content || []);
      setObrigacoes(obRes.data.content || []);
      setObrigacoesVencendo(vencendoRes.data || []);
      setObrigacoesAtrasadas(atrasadasRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = () => {
    const style = document.createElement('style');
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #relatorio-pdf, #relatorio-pdf * { visibility: visible; }
        #relatorio-pdf { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        @page { margin: 20mm; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const entregues = obrigacoes.filter(o => o.status === 'ENTREGUE');
  const pendentes = obrigacoes.filter(o => o.status === 'PENDENTE' && !o.atrasada);
  const taxaEntrega = obrigacoes.length > 0 ? Math.round((entregues.length / obrigacoes.length) * 100) : 0;

  const regimes = clientes.reduce((acc, c) => {
    acc[c.regimeTributario] = (acc[c.regimeTributario] || 0) + 1;
    return acc;
  }, {});

  const tiposObrigacoes = obrigacoes.reduce((acc, o) => {
    acc[o.tipo] = (acc[o.tipo] || 0) + 1;
    return acc;
  }, {});

  const clientesComRisco = clientes.filter(c =>
    obrigacoesAtrasadas.some(o => o.clienteId === c.id)
  );

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', color: C.accent }}>Carregando...</div>
    </div>
  );

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="no-print" style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Relatórios</div>
          <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Visão analítica do escritório</div>
        </div>
        <button onClick={handleExportarPDF} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
          📄 Exportar PDF
        </button>
      </div>

      <div id="relatorio-pdf" style={{ padding: '24px 32px' }}>

        {/* Cabeçalho do relatório — visível apenas no PDF */}
        <div style={{ display: 'none' }} className="print-header">
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: `2px solid ${C.accent}`, paddingBottom: '16px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '24px', color: C.accent }}>ContaFlow</div>
            <div style={{ fontSize: '14px', color: C.muted, marginTop: '4px' }}>Relatório Gerencial — {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* KPIs principais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total de Clientes', value: clientes.length, icon: '👥', color: C.accent },
            { label: 'Total de Obrigações', value: obrigacoes.length, icon: '📋', color: C.accent2 },
            { label: 'Taxa de Entrega', value: `${taxaEntrega}%`, icon: '✅', color: C.green },
            { label: 'Em Risco', value: clientesComRisco.length, icon: '⚠️', color: C.red },
          ].map((kpi, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: kpi.color }} />
              <div style={{ fontSize: '12px', color: C.muted, marginBottom: '8px' }}>{kpi.label}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '24px', opacity: 0.15 }}>{kpi.icon}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Status das obrigações */}
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text, marginBottom: '20px' }}>Status das Obrigações</div>
            {[
              { label: 'Entregues', value: entregues.length, total: obrigacoes.length, color: C.green },
              { label: 'Pendentes', value: pendentes.length, total: obrigacoes.length, color: C.yellow },
              { label: 'Atrasadas', value: obrigacoesAtrasadas.length, total: obrigacoes.length, color: C.red },
              { label: 'Vencendo em 30d', value: obrigacoesVencendo.length, total: obrigacoes.length, color: C.accent },
            ].map(item => {
              const pct = obrigacoes.length > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={item.label} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: C.text, fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value} <span style={{ color: C.muted, fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height: '6px', background: C.surface2, borderRadius: '3px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Distribuição por regime */}
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text, marginBottom: '20px' }}>Clientes por Regime Tributário</div>
            {Object.entries(regimes).length === 0 ? (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '13px', padding: '20px' }}>Nenhum cliente cadastrado</div>
            ) : (
              Object.entries(regimes).map(([regime, qtd], i) => {
                const cores = [C.accent, C.accent2, C.yellow, C.green, C.red];
                const pct = Math.round((qtd / clientes.length) * 100);
                return (
                  <div key={regime} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: C.text, fontWeight: 500 }}>{regime.replace('_', ' ')}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: cores[i % cores.length] }}>{qtd} <span style={{ color: C.muted, fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: '6px', background: C.surface2, borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cores[i % cores.length], borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Tipos de obrigações */}
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text, marginBottom: '20px' }}>Obrigações por Tipo</div>
            {Object.entries(tiposObrigacoes).length === 0 ? (
              <div style={{ textAlign: 'center', color: C.muted, fontSize: '13px', padding: '20px' }}>Nenhuma obrigação cadastrada</div>
            ) : (
              Object.entries(tiposObrigacoes)
                .sort((a, b) => b[1] - a[1])
                .map(([tipo, qtd]) => (
                  <div key={tipo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: `${C.accent}11`, color: C.accent, border: `1px solid ${C.accent}33` }}>
                        {tipo}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '80px', height: '4px', background: C.surface2, borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${(qtd / obrigacoes.length) * 100}%`, background: C.accent, borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: C.text, minWidth: '20px', textAlign: 'right' }}>{qtd}</span>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Clientes em risco */}
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text, marginBottom: '4px' }}>Clientes em Risco</div>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '16px' }}>Com obrigações atrasadas</div>
            {clientesComRisco.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: C.green }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                <div style={{ fontSize: '13px' }}>Nenhum cliente em risco!</div>
              </div>
            ) : (
              clientesComRisco.map((cliente) => {
                const qtdAtrasadas = obrigacoesAtrasadas.filter(o => o.clienteId === cliente.id).length;
                return (
                  <div key={cliente.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ef444422', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚠️</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{cliente.nome}</div>
                        <div style={{ fontSize: '11px', color: C.muted }}>{cliente.regimeTributario?.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <span style={{ background: '#ef444422', color: C.red, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {qtdAtrasadas} atrasada{qtdAtrasadas > 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tabela completa de clientes */}
        <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text }}>Lista Completa de Clientes</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '10px 20px', background: C.surface2, fontSize: '11px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>Cliente</div><div>CNPJ/CPF</div><div>Regime</div><div>Status</div>
          </div>
          {clientes.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: '13px' }}>Nenhum cliente cadastrado</div>
          ) : (
            clientes.map((cliente) => {
              const temAtrasada = obrigacoesAtrasadas.some(o => o.clienteId === cliente.id);
              return (
                <div key={cliente.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: C.text }}>{cliente.nome}</div>
                  <div style={{ color: C.muted }}>{cliente.cpfCnpj}</div>
                  <div style={{ color: C.muted }}>{cliente.regimeTributario?.replace('_', ' ')}</div>
                  <div>
                    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: temAtrasada ? '#ef444422' : '#10b98122', color: temAtrasada ? C.red : C.green }}>
                      {temAtrasada ? '⚠ Em risco' : '✓ Em dia'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do relatório */}
        <div style={{ textAlign: 'center', padding: '16px', color: C.muted, fontSize: '11px', borderTop: `1px solid ${C.border}` }}>
          Relatório gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')} · ContaFlow — Gestão Contábil Inteligente
        </div>

      </div>
    </div>
  );
}