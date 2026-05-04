import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const response = await api.post('/auth/login', { email, senha });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('tenantId', response.data.tenantId);
      navigate('/dashboard');
    } catch (error) {
      setErro(error.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.logo}>
          <svg width="80" height="80" viewBox="0 0 160 160" style={{ marginBottom: '8px' }}>
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
          <h1 style={styles.logoText}><span style={{ color: '#fff' }}>Conta</span>Flow</h1>
          <p style={styles.logoSub}>Gestão Contábil Inteligente</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          {erro && <p style={styles.erro}>{erro}</p>}
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.footer}>
          Não tem conta?{' '}
          <span style={styles.link} onClick={() => navigate('/registrar')}>
            Criar escritório
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  card: {
    background: '#1e1e2e',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    border: '1px solid #2a2a3e',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoText: { color: '#6366f1', fontSize: '32px', fontWeight: '800', margin: '0' },
  logoSub: { color: '#888', fontSize: '14px', margin: '4px 0 0 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#ccc', fontSize: '14px', fontWeight: '500' },
  input: {
    background: '#2a2a3e',
    border: '1px solid #3a3a5e',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  erro: { color: '#ef4444', fontSize: '14px', textAlign: 'center', margin: '0' },
  button: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  footer: { color: '#888', fontSize: '14px', textAlign: 'center', marginTop: '24px' },
  link: { color: '#6366f1', cursor: 'pointer', fontWeight: '500' },
};