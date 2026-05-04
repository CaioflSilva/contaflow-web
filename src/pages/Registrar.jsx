import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Registrar() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
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
          <h1 style={{ color: '#6366f1', fontSize: '28px', fontWeight: 800, margin: 0 }}>ContaFlow</h1>
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

        {/* Step 1 — Dados do escritório */}
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

            <button
              onClick={() => {
                if (!form.nomeEscritorio || !form.cnpj || !form.email) {
                  setErro('Preencha os campos obrigatórios');
                  return;
                }
                setErro('');
                setStep(2);
              }}
              style={{ width: '100%', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              Continuar →
            </button>
          </div>
        )}

        {/* Step 2 — Dados de acesso */}
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
            <div style={{ background: '#16172a', borderRadius: '8px', padding: '12px', marginBottom: '20px', border: '1px solid #2a2a3e' }}>
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

            {erro && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{erro}</p>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setStep(1); setErro(''); }} style={{ flex: 1, background: '#2a2a3e', color: '#ccc', border: '1px solid #3a3a5e', borderRadius: '8px', padding: '14px', fontSize: '14px', cursor: 'pointer' }}>
                ← Voltar
              </button>
              <button onClick={handleRegistrar} disabled={loading} style={{ flex: 2, background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
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