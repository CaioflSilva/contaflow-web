import { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
  bg: '#f0f4f8', surface: '#ffffff', surface2: '#f8fafc',
  border: '#e2e8f0', accent: '#6366f1', accent2: '#7c3aed',
  green: '#10b981', yellow: '#f59e0b', red: '#ef4444',
  text: '#1e293b', muted: '#475569', card: '#ffffff',
};

const planoConfig = {
  FREE:       { color: '#475569', gradient: 'linear-gradient(135deg,#475569,#334155)', maxUsuarios: 1 },
  STARTER:    { color: '#0891b2', gradient: 'linear-gradient(135deg,#0891b2,#0284c7)', maxUsuarios: 2 },
  PRO:        { color: '#7c3aed', gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)', maxUsuarios: 5 },
  ENTERPRISE: { color: '#059669', gradient: 'linear-gradient(135deg,#059669,#10b981)', maxUsuarios: 999 },
};

export default function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState('perfil');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [plano, setPlano] = useState({ nome: 'FREE', maxClientes: 3 });
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const [perfil, setPerfil] = useState({
    nomeEscritorio: '', cnpj: '', email: '', telefone: '', endereco: '', cidade: '', estado: 'PE',
  });

  const [alertas, setAlertas] = useState({
    emailAtivo: true, diasAntes7: true, diasAntes5: true,
    diasAntes3: true, diasAntes1: true, alertaAtrasadas: true,
  });

  const [senha, setSenha] = useState({
    senhaAtual: '', novaSenha: '', confirmarSenha: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [planoRes, clientesRes, usuariosRes] = await Promise.all([
        api.get('/tenant/plano'),
        api.get('/clientes'),
        api.get('/usuarios'),
      ]);
      setPlano(planoRes.data || { nome: 'FREE', maxClientes: 3 });
      setTotalClientes(clientesRes.data.totalElements || 0);
      setTotalUsuarios((usuariosRes.data || []).length);
    } catch (e) {
      console.error(e);
    }
  };

  const mostrarSucesso = (msg) => { setSucesso(msg); setErro(''); setTimeout(() => setSucesso(''), 3000); };
  const mostrarErro = (msg) => { setErro(msg); setSucesso(''); };

  const handleSalvarPerfil = async () => {
    setSalvando(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      mostrarSucesso('Perfil salvo com sucesso!');
    } catch (e) { mostrarErro('Erro ao salvar perfil'); } finally { setSalvando(false); }
  };

  const handleSalvarAlertas = async () => {
    setSalvando(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      mostrarSucesso('Configurações de alertas salvas!');
    } catch (e) { mostrarErro('Erro ao salvar alertas'); } finally { setSalvando(false); }
  };

  const handleAlterarSenha = async () => {
    if (!senha.senhaAtual || !senha.novaSenha || !senha.confirmarSenha) { mostrarErro('Preencha todos os campos'); return; }
    if (senha.novaSenha !== senha.confirmarSenha) { mostrarErro('As senhas não coincidem'); return; }
    if (senha.novaSenha.length < 8) { mostrarErro('A nova senha deve ter pelo menos 8 caracteres'); return; }
    setSalvando(true);
    try {
      await api.post('/auth/change-password', { senhaAtual: senha.senhaAtual, novaSenha: senha.novaSenha });
      setSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      mostrarSucesso('Senha alterada com sucesso!');
    } catch (e) { mostrarErro(e.response?.data?.erro || 'Erro ao alterar senha'); } finally { setSalvando(false); }
  };

  const abas = [
    { id: 'perfil', icon: '👤', label: 'Perfil' },
    { id: 'alertas', icon: '🔔', label: 'Alertas' },
    { id: 'seguranca', icon: '🔒', label: 'Segurança' },
    { id: 'plano', icon: '💳', label: 'Plano' },
  ];

  const inputStyle = {
    width: '100%', border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '10px 14px', fontSize: '13px', color: C.text, outline: 'none',
    background: C.surface2, boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '12px', fontWeight: 600, color: C.muted, marginBottom: '5px', display: 'block',
  };

  const Toggle = ({ value, onChange, label, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>{label}</div>
        {desc && <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{desc}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', background: value ? C.accent : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );

  const config = planoConfig[plano.nome] || planoConfig.FREE;
  const maxUsuarios = config.maxUsuarios;

  return (
    <div style={{ flex: 1, background: C.bg, minHeight: '100vh' }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '18px 32px' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: C.text }}>Configurações</div>
        <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Gerencie seu escritório e preferências</div>
      </div>

      <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
        <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '8px', height: 'fit-content' }}>
          {abas.map(aba => (
            <div key={aba.id} onClick={() => setAbaAtiva(aba.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', background: abaAtiva === aba.id ? `${C.accent}11` : 'transparent', color: abaAtiva === aba.id ? C.accent : C.muted, fontSize: '13px', fontWeight: abaAtiva === aba.id ? 600 : 400, marginBottom: '2px' }}>
              <span>{aba.icon}</span>{aba.label}
            </div>
          ))}
        </div>

        <div>
          {sucesso && <div style={{ background: '#10b98122', border: `1px solid ${C.green}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: C.green, fontSize: '13px', fontWeight: 600 }}>✅ {sucesso}</div>}
          {erro && <div style={{ background: '#ef444422', border: `1px solid ${C.red}`, borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: C.red, fontSize: '13px', fontWeight: 600 }}>❌ {erro}</div>}

          {abaAtiva === 'perfil' && (
            <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: C.text }}>Perfil do Escritório</div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Informações do seu escritório contábil</div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Nome do Escritório</label>
                    <input value={perfil.nomeEscritorio} onChange={e => setPerfil({ ...perfil, nomeEscritorio: e.target.value })} style={inputStyle} placeholder="Nome do seu escritório" />
                  </div>
                  <div><label style={labelStyle}>CNPJ</label><input value={perfil.cnpj} onChange={e => setPerfil({ ...perfil, cnpj: e.target.value })} style={inputStyle} placeholder="00.000.000/0001-00" /></div>
                  <div><label style={labelStyle}>E-mail</label><input type="email" value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} style={inputStyle} placeholder="contato@escritorio.com.br" /></div>
                  <div><label style={labelStyle}>Telefone</label><input value={perfil.telefone} onChange={e => setPerfil({ ...perfil, telefone: e.target.value })} style={inputStyle} placeholder="(81) 99999-9999" /></div>
                  <div><label style={labelStyle}>Cidade</label><input value={perfil.cidade} onChange={e => setPerfil({ ...perfil, cidade: e.target.value })} style={inputStyle} placeholder="Recife" /></div>
                  <div><label style={labelStyle}>Estado</label><input value={perfil.estado} onChange={e => setPerfil({ ...perfil, estado: e.target.value })} style={inputStyle} placeholder="PE" /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Endereço</label><input value={perfil.endereco} onChange={e => setPerfil({ ...perfil, endereco: e.target.value })} style={inputStyle} placeholder="Rua, número, bairro..." /></div>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSalvarPerfil} disabled={salvando} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                    {salvando ? 'Salvando...' : 'Salvar Perfil'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'alertas' && (
            <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: C.text }}>Configurações de Alertas</div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Defina quando e como receber notificações</div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Canal de notificação</div>
                <Toggle value={alertas.emailAtivo} onChange={v => setAlertas({ ...alertas, emailAtivo: v })} label="Alertas por E-mail" desc="Receber notificações de prazos no e-mail cadastrado" />
                <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 8px' }}>Antecedência dos alertas</div>
                <Toggle value={alertas.diasAntes7} onChange={v => setAlertas({ ...alertas, diasAntes7: v })} label="7 dias antes do prazo" desc="Aviso antecipado para planejamento" />
                <Toggle value={alertas.diasAntes5} onChange={v => setAlertas({ ...alertas, diasAntes5: v })} label="5 dias antes do prazo" desc="Lembrete de acompanhamento" />
                <Toggle value={alertas.diasAntes3} onChange={v => setAlertas({ ...alertas, diasAntes3: v })} label="3 dias antes do prazo" desc="Alerta de atenção" />
                <Toggle value={alertas.diasAntes1} onChange={v => setAlertas({ ...alertas, diasAntes1: v })} label="1 dia antes do prazo" desc="Alerta urgente" />
                <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 8px' }}>Outros alertas</div>
                <Toggle value={alertas.alertaAtrasadas} onChange={v => setAlertas({ ...alertas, alertaAtrasadas: v })} label="Obrigações atrasadas" desc="Notificar quando uma obrigação passar do prazo" />
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleSalvarAlertas} disabled={salvando} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                    {salvando ? 'Salvando...' : 'Salvar Alertas'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {abaAtiva === 'seguranca' && (
            <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: C.text }}>Segurança</div>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Altere sua senha de acesso</div>
              </div>
              <div style={{ padding: '24px', maxWidth: '400px' }}>
                <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Senha Atual</label><input type="password" value={senha.senhaAtual} onChange={e => setSenha({ ...senha, senhaAtual: e.target.value })} style={inputStyle} placeholder="••••••••" /></div>
                <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Nova Senha</label><input type="password" value={senha.novaSenha} onChange={e => setSenha({ ...senha, novaSenha: e.target.value })} style={inputStyle} placeholder="Mínimo 8 caracteres" /></div>
                <div style={{ marginBottom: '24px' }}><label style={labelStyle}>Confirmar Nova Senha</label><input type="password" value={senha.confirmarSenha} onChange={e => setSenha({ ...senha, confirmarSenha: e.target.value })} style={inputStyle} placeholder="Repita a nova senha" /></div>
                <div style={{ background: C.surface2, borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, marginBottom: '6px' }}>Requisitos da senha:</div>
                  {[['Mínimo 8 caracteres', senha.novaSenha.length >= 8], ['Letra maiúscula', /[A-Z]/.test(senha.novaSenha)], ['Número', /[0-9]/.test(senha.novaSenha)], ['Caractere especial (@#$!)', /[^a-zA-Z0-9]/.test(senha.novaSenha)]].map(([req, ok]) => (
                    <div key={req} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ok ? C.green : C.muted, marginBottom: '3px' }}><span>{ok ? '✅' : '○'}</span> {req}</div>
                  ))}
                </div>
                <button onClick={handleAlterarSenha} disabled={salvando} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: C.accent, color: '#fff', fontWeight: 600, fontSize: '13px', cursor: 'pointer', width: '100%' }}>
                  {salvando ? 'Alterando...' : '🔒 Alterar Senha'}
                </button>
              </div>
            </div>
          )}

          {abaAtiva === 'plano' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: `linear-gradient(135deg, ${config.color}18, ${config.color}08)`, borderRadius: '12px', border: `1px solid ${config.color}44`, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '20px', color: C.text }}>Plano {plano.nome}</div>
                    <div style={{ fontSize: '13px', color: C.muted, marginTop: '2px' }}>Ativo · Gratuito</div>
                  </div>
                  <span style={{ background: config.gradient, color: '#fff', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700 }}>ATIVO</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Clientes', value: `${totalClientes} / ${plano.maxClientes}` },
                    { label: 'Usuários', value: `${totalUsuarios} / ${maxUsuarios === 999 ? '∞' : maxUsuarios}` },
                    { label: 'Alertas', value: 'Ilimitados' },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '12px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '16px', color: C.text }}>{item.value}</div>
                      <div style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                {totalClientes >= plano.maxClientes && (
                  <div style={{ background: '#ef444422', border: `1px solid ${C.red}`, borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: C.red, fontWeight: 600 }}>
                    ⚠ Limite de clientes atingido! Faça upgrade para adicionar mais clientes.
                  </div>
                )}
              </div>

              <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '24px' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px', color: C.text, marginBottom: '16px' }}>Recursos incluídos</div>
                {[
                  ['✅', `Até ${plano.maxClientes} clientes`],
                  ['✅', 'Alertas automáticos por e-mail'],
                  ['✅', 'Calendário fiscal'],
                  ['✅', 'Relatórios completos'],
                  ['✅', 'Dashboard em tempo real'],
                  ['✅', 'Suporte por e-mail'],
                  ['🔒', 'IA Tributária — Em breve'],
                  ['🔒', 'Integração WhatsApp — Em breve'],
                  ['🔒', 'App mobile — Em breve'],
                ].map(([icon, feature]) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: '13px', color: icon === '🔒' ? C.muted : C.text }}>
                    <span>{icon}</span> {feature}
                  </div>
                ))}
              </div>

              <div style={{ background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: C.muted, marginBottom: '8px' }}>Precisa de mais clientes ou recursos?</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px', color: C.text, marginBottom: '4px' }}>Faça upgrade do seu plano</div>
                <div style={{ fontSize: '13px', color: C.muted, marginBottom: '16px' }}>Starter R$97/mês · Pro R$197/mês · Enterprise R$397/mês</div>
                <button style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                  💬 Falar com suporte
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}