import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export default function Calendario() {
  const [obrigacoes, setObrigacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(null);

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

  const getDiasNoMes = (mes, ano) => new Date(ano, mes + 1, 0).getDate();
  const getPrimeiroDia = (mes, ano) => new Date(ano, mes, 1).getDay();

  const getObrigacoesDoDia = (dia) => {
    return obrigacoes.filter(ob => {
      const prazo = new Date(ob.prazo);
      return prazo.getDate() === dia &&
             prazo.getMonth() === mesAtual &&
             prazo.getFullYear() === anoAtual;
    });
  };

  const getClienteNome = (id) => clientes.find(c => c.id === id)?.nome || 'Cliente';

  const getDotColor = (obs) => {
    if (obs.some(o => o.atrasada)) return C.red;
    if (obs.some(o => {
      const dias = Math.ceil((new Date(o.prazo) - new Date()) / 86400000);
      return dias <= 7;
    })) return C.yellow;
    return C.accent;
  };

  const diasNoMes = getDiasNoMes(mesAtual, anoAtual);
  const primeiroDia = getPrimeiroDia(mesAtual, anoAtual);
  const hoje = new Date();
  const obrigacoesDiaSelecionado = diaSelecionado ? getObrigacoesDoDia(diaSelecionado) : [];

  const navegarMes = (direcao) => {
    if (direcao === -1 && mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else if (direcao === 1 && mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + direcao);
    }
    setDiaSelecionado(null);
  };

  // Obrigações do mês ordenadas por prazo
  const obrigacoesMes = obrigacoes.filter(ob => {
    const prazo = new Date(ob.prazo);
    return prazo.getMonth() === mesAtual && prazo.getFullYear() === anoAtual;
  }).sort((a, b) => new Date(a.prazo) - new Date(b.prazo));

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Calendário Fiscal</div>
        <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{obrigacoesMes.length} obrigações em {MESES[mesAtual]}</div>
      </div>

      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

        {/* Calendário */}
        <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>

          {/* Navegação */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => navegarMes(-1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: '16px', color: C.text }}>‹</button>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>
              {MESES[mesAtual]} {anoAtual}
            </div>
            <button onClick={() => navegarMes(1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', cursor: 'pointer', fontSize: '16px', color: C.text }}>›</button>
          </div>

          {/* Dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '12px 16px 4px' }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: C.muted, padding: '4px' }}>{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 16px 16px', gap: '4px' }}>
            {Array.from({ length: primeiroDia }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: diasNoMes }).map((_, i) => {
              const dia = i + 1;
              const obs = getObrigacoesDoDia(dia);
              const isHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();
              const isSelecionado = dia === diaSelecionado;
              const temObrigacoes = obs.length > 0;

              return (
                <div
                  key={dia}
                  onClick={() => setDiaSelecionado(dia === diaSelecionado ? null : dia)}
                  style={{
                    padding: '8px 4px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    cursor: temObrigacoes ? 'pointer' : 'default',
                    background: isSelecionado ? C.accent : isHoje ? `${C.accent}11` : 'transparent',
                    border: isHoje && !isSelecionado ? `1px solid ${C.accent}` : '1px solid transparent',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: isHoje || isSelecionado ? 700 : 400, color: isSelecionado ? '#fff' : isHoje ? C.accent : C.text }}>
                    {dia}
                  </div>
                  {temObrigacoes && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                      {obs.slice(0, 3).map((ob, idx) => (
                        <div key={idx} style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSelecionado ? '#fff' : getDotColor([ob]) }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legenda */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: '16px' }}>
            {[['Urgente (≤7d)', C.red], ['Atenção', C.yellow], ['Normal', C.accent]].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.muted }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Painel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Detalhe do dia selecionado */}
          {diaSelecionado && (
            <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text }}>
                  {diaSelecionado} de {MESES[mesAtual]}
                </div>
                <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{obrigacoesDiaSelecionado.length} obrigações</div>
              </div>
              {obrigacoesDiaSelecionado.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>Nenhuma obrigação neste dia</div>
              ) : (
                obrigacoesDiaSelecionado.map(ob => (
                  <div key={ob.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{getClienteNome(ob.clienteId)}</div>
                        <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{ob.tipo} · {ob.competencia}</div>
                      </div>
                      <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: ob.status === 'ENTREGUE' ? '#10b98122' : '#f59e0b22', color: ob.status === 'ENTREGUE' ? C.green : C.yellow }}>
                        {ob.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Lista do mês */}
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', color: C.text }}>Obrigações do Mês</div>
            </div>
            {obrigacoesMes.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: C.muted, fontSize: '12px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                Nenhuma obrigação neste mês
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {obrigacoesMes.map(ob => {
                  const dias = Math.ceil((new Date(ob.prazo) - new Date()) / 86400000);
                  const cor = ob.atrasada ? C.red : dias <= 7 ? C.yellow : C.green;
                  return (
                    <div key={ob.id} style={{ padding: '12px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${cor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: cor, fontFamily: 'Syne, sans-serif' }}>
                          {new Date(ob.prazo).getDate()}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{getClienteNome(ob.clienteId)}</div>
                          <div style={{ fontSize: '11px', color: C.muted }}>{ob.tipo}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: cor }}>
                          {ob.atrasada ? 'Atrasada' : dias === 0 ? 'Hoje' : `${dias}d`}
                        </div>
                        <div style={{ fontSize: '10px', color: C.muted }}>{ob.prazo}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}