import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Registrar() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [form, setForm] = useState({
    nomeEscritorio: '',
    cnpj: '',
    email: '',
    telefone: '',
    nomeUsuario: '',
    senha: '',
    confirmarSenha: '',
  });
  const navigate = useNavigate();

  const handleRegistrar = async () => {
    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade');
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }
    if (form.senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    setLoading(true);
    setErro('');
    try {
      const response = await api.post('/auth/registrar', {
        nomeEscritorio: form.nomeEscritorio,
        cnpj: form.cnpj,
        email: form.email,
        telefone: form.telefone,
        nomeUsuario: form.nomeUsuario,
        senha: form.senha,
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('tenantId', response.data.tenantId);
      navigate('/dashboard');
    } catch (error) {
      setErro(error.response?.data?.erro || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const input = {
    width: '100%', background: '#1e1e2e', border: '1px solid #3a3a5e',
    borderRadius: '8px', padding: '12px 16px', color: '#fff',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  const label = {
    color: '#ccc', fontSize: '13px', fontWeight: 500,
    marginBottom: '6px', display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ background: '#1e1e2e', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid #2a2a3e' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg width="60" height="60" viewBox="0 0 160 160" style={{ marginBottom: '8px' }}>
            <polygon points="80,10 140,45 140,115 80,150 20,115 20,45" fill="none" stroke="#6366f1" strokeWidth="4"/>
            <polygon points="80,32 118,54 118,98 80,120 42,98 42,54" fill="none" stroke="#818cf8" strokeWidth="2.5" opacity="0.6"/>
            <line x1="80" y1="15" x2="80" y2="145" stroke="#6366f1" strokeWidth="2" opacity="0.3"/>
            <line x1="15" y1="80" x2="145" y2="80" stroke="#6366f1" strokeWidth="2" opacity="0.3"/>
            <line x1="20" y1="45" x2="140" y2="115" stroke="#6366f1" strokeWidth="1.5" opacity="0.25"/>
            <line x1="140" y1="45" x2="20" y2="115" stroke="#6366f1" strokeWidth="1.5" opacity="0.25"/>
            <circle cx="80" cy="80" r="12" fill="#6366f1"/>
            <circle cx="80" cy="80" r="6" fill="#c7d2fe"/>
            <circle cx="80" cy="10" r="5" fill="#818cf8"/>
            <circle cx="140" cy="45" r="5" fill="#818cf8"/>
            <circle cx="140" cy="115" r="5" fill="#818cf8"/>
            <circle cx="80" cy="150" r="5" fill="#818cf8"/>
            <circle cx="20" cy="115" r="5" fill="#818cf8"/>
            <circle cx="20" cy="45" r="5" fill="#818cf8"/>
          </svg>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, margin: 0 }}>
            <span style={{ color: '#fff' }}>Conta</span><span style={{ color: '#6366f1' }}>Flow</span>
          </h1>
          <p style={{ color: '#888', fontSize: '13px', margin: '6px 0 0' }}>Crie sua conta gratuitamente</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
          {[1, 2].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i === 0 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step >= s ? '#6366f1' : '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: step >= s ? '#fff' : '#666', border: step >= s ? 'none' : '1px solid #3a3a5e' }}>
                  {s}
                </div>
                <span style={{ fontSize: '12px', color: step >= s ? '#fff' : '#666' }}>
                  {s === 1 ? 'Escritório' : 'Acesso'}
                </span>
              </div>
              {i === 0 && <div style={{ flex: 1, height: '1px', background: step >= 2 ? '#6366f1' : '#2a2a3e', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Nome do Escritório *</label>
              <input value={form.nomeEscritorio} onChange={e => setForm({ ...form, nomeEscritorio: e.target.value })} placeholder="Ex: Escritório Silva & Associados" style={input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>CNPJ do Escritório *</label>
              <input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" style={input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>E-mail *</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contato@escritorio.com.br" style={input} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={label}>Telefone</label>
              <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(81) 99999-9999" style={input} />
            </div>
            {erro && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{erro}</p>}
            <button onClick={() => {
              if (!form.nomeEscritorio || !form.cnpj || !form.email) {
                setErro('Preencha os campos obrigatórios');
                return;
              }
              setErro('');
              setStep(2);
            }} style={{ width: '100%', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Seu Nome *</label>
              <input value={form.nomeUsuario} onChange={e => setForm({ ...form, nomeUsuario: e.target.value })} placeholder="Nome do responsável" style={input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Senha *</label>
              <input type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Mínimo 8 caracteres" style={input} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Confirmar Senha *</label>
              <input type="password" value={form.confirmarSenha} onChange={e => setForm({ ...form, confirmarSenha: e.target.value })} placeholder="Repita a senha" style={input} />
            </div>

            {/* Requisitos */}
            <div style={{ background: '#16172a', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid #2a2a3e' }}>
              {[
                ['Mínimo 8 caracteres', form.senha.length >= 8],
                ['Letra maiúscula', /[A-Z]/.test(form.senha)],
                ['Número', /[0-9]/.test(form.senha)],
                ['Caractere especial', /[^a-zA-Z0-9]/.test(form.senha)],
              ].map(([req, ok]) => (
                <div key={req} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ok ? '#10b981' : '#666', marginBottom: '3px' }}>
                  <span>{ok ? '✅' : '○'}</span> {req}
                </div>
              ))}
            </div>

            {/* Checkbox termos */}
            <div onClick={() => setAceitouTermos(!aceitouTermos)} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: `1px solid ${aceitouTermos ? '#6366f1' : '#3a3a5e'}`, background: aceitouTermos ? '#6366f111' : 'transparent' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${aceitouTermos ? '#6366f1' : '#555'}`, background: aceitouTermos ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                {aceitouTermos && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.5 }}>
                Li e aceito os{' '}
                <span style={{ color: '#6366f1' }}>Termos de Uso</span>
                {' '}e a{' '}
                <span style={{ color: '#6366f1' }}>Política de Privacidade</span>
                {' '}do ContaFlow. Concordo com o tratamento dos meus dados conforme a LGPD.
              </span>
            </div>

            {erro && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{erro}</p>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setStep(1); setErro(''); }} style={{ flex: 1, background: '#2a2a3e', color: '#ccc', border: '1px solid #3a3a5e', borderRadius: '8px', padding: '14px', fontSize: '14px', cursor: 'pointer' }}>
                ← Voltar
              </button>
              <button onClick={handleRegistrar} disabled={loading || !aceitouTermos} style={{ flex: 2, background: aceitouTermos ? '#6366f1' : '#3a3a5e', color: aceitouTermos ? '#fff' : '#666', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: aceitouTermos ? 'pointer' : 'not-allowed' }}>
                {loading ? 'Criando conta...' : '🚀 Criar Conta'}
              </button>
            </div>
          </div>
        )}

        <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
          Já tem uma conta?{' '}
          <span onClick={() => navigate('/login')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 500 }}>
            Fazer login
          </span>
        </p>
      </div>
    </div>
  );
}