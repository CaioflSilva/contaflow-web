import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569',
};

const acaoConfig = {
  CRIAR:    { label: 'Criou',    color: '#10b981', bg: '#10b98122', icon: '➕' },
  EDITAR:   { label: 'Editou',   color: '#6366f1', bg: '#6366f122', icon: '✏️' },
  EXCLUIR:  { label: 'Excluiu',  color: '#ef4444', bg: '#ef444422', icon: '🗑️' },
  INATIVAR: { label: 'Inativou', color: '#f59e0b', bg: '#f59e0b22', icon: '⛔' },
  ENTREGAR: { label: 'Entregou', color: '#10b981', bg: '#10b98122', icon: '✅' },
  GERAR:    { label: 'Gerou',    color: '#7c3aed', bg: '#7c3aed22', icon: '⚡' },
};

const entidadeLabel = {
  CLIENTE:   '👥 Cliente',
  OBRIGACAO: '📋 Obrigação',
};

export default function Historico() {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  useEffect(() => { carregarHistorico(); }, [pagina]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/historico?page=${pagina}&size=20&sort=criadoEm,desc`);
      setHistorico(res.data.content || []);
      setTotalPaginas(res.data.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataStr) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Histórico de Alterações</div>
        <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Registro de todas as ações realizadas no sistema</div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>Carregando...</div>
        ) : historico.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.muted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: C.text }}>Nenhuma ação registrada ainda</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>As ações aparecerão aqui conforme você usar o sistema</div>
          </div>
        ) : (
          <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 100px 120px 1fr 180px', padding: '12px 20px', background: C.surface2, fontSize: '11px', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <div>Ação</div>
              <div>Entidade</div>
              <div>Usuário</div>
              <div>Descrição</div>
              <div>Data</div>
            </div>
            {historico.map((item) => {
              const acao = acaoConfig[item.acao] || { label: item.acao, color: C.muted, bg: C.surface2, icon: '📌' };
              return (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px 120px 1fr 180px', padding: '14px 20px', borderTop: `1px solid ${C.border}`, alignItems: 'center', fontSize: '12px' }}>
                  <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: acao.bg, color: acao.color }}>
                      {acao.icon} {acao.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: C.muted }}>
                    {entidadeLabel[item.entidade] || item.entidade}
                  </div>
                  <div style={{ fontSize: '12px', color: C.text, fontWeight: 500 }}>
                    {item.usuarioNome || 'Sistema'}
                  </div>
                  <div style={{ fontSize: '12px', color: C.muted }}>
                    {item.descricao}
                  </div>
                  <div style={{ fontSize: '11px', color: C.muted }}>
                    {formatarData(item.criadoEm)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <button onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={pagina === 0}
              style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: pagina === 0 ? C.surface2 : C.surface, color: pagina === 0 ? C.muted : C.text, cursor: pagina === 0 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
              ← Anterior
            </button>
            <span style={{ padding: '8px 16px', fontSize: '12px', color: C.muted }}>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))} disabled={pagina === totalPaginas - 1}
              style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, background: pagina === totalPaginas - 1 ? C.surface2 : C.surface, color: pagina === totalPaginas - 1 ? C.muted : C.text, cursor: pagina === totalPaginas - 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}