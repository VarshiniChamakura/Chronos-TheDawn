import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', 'logged-in'); // Simple token for demo
          localStorage.setItem('username', formData.username);
          setMessage('✅ Login successful! Redirecting to game...');
          setTimeout(() => navigate('/game'), 1500);
        } else {
          setMessage('✅ Account created successfully! You can now login.');
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '' });
        }
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      background: "linear-gradient(to bottom, #101632 80%, #142355 100%)",
      color: "#f3f3f3",
      fontFamily: "'Share Tech Mono', 'Fira Mono', 'Consolas', 'Monaco', monospace",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    },
    formContainer: {
      background: "#081629",
      borderRadius: 12,
      boxShadow: "0 0 0 3px #1fff7a, 0 2px 28px 4px #20ff6d55",
      border: "1.5px solid #13ff53",
      padding: "40px",
      width: "100%",
      maxWidth: "480px"
    },
    title: {
      color: "#ff6600",
      fontSize: "2.5rem",
      textAlign: "center",
      marginBottom: "30px",
      textShadow: "0 0 16px #ff7f5080, 0 0 30px #fcf67b40",
      letterSpacing: "0.09em",
      whiteSpace: "nowrap"
    },
    subtitle: {
      color: "#39ff14",
      fontSize: "1.1rem",
      textAlign: "center",
      marginBottom: "30px",
      textShadow: "0 0 6px #39ff1455"
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px"
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    },
    label: {
      color: "#ffcc00",
      fontSize: "1rem",
      fontWeight: "bold"
    },
    input: {
      background: "#0a1a2e",
      border: "2px solid #39ff14",
      borderRadius: "6px",
      padding: "12px",
      color: "#f3f3f3",
      fontSize: "1rem",
      fontFamily: "inherit",
      outline: "none",
      transition: "border-color 0.3s, box-shadow 0.3s"
    },
    inputFocus: {
      borderColor: "#ff6600",
      boxShadow: "0 0 10px #ff660080"
    },
    button: {
      background: "linear-gradient(90deg, #f97063 20%, #d37752 80%)",
      border: "2px solid #97fa97",
      borderRadius: "8px",
      padding: "15px",
      color: "#e7f612",
      fontSize: "1.1rem",
      fontFamily: "inherit",
      fontWeight: "bold",
      cursor: "pointer",
      outline: "none",
      transition: "all 0.3s",
      marginTop: "10px"
    },
    buttonHover: {
      background: "linear-gradient(90deg, #44c2f4 30%, #10f792 90%)",
      boxShadow: "0 0 22px #7de26b, 0 0 8px #7bece3a0",
      transform: "translateY(-2px)"
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    toggleButton: {
      background: "transparent",
      border: "1px solid #39ff14",
      borderRadius: "6px",
      padding: "10px",
      color: "#39ff14",
      fontSize: "0.9rem",
      fontFamily: "inherit",
      cursor: "pointer",
      outline: "none",
      transition: "all 0.3s",
      marginTop: "10px"
    },
    message: {
      textAlign: "center",
      padding: "10px",
      borderRadius: "6px",
      marginTop: "15px",
      fontSize: "0.9rem"
    },
    messageSuccess: {
      background: "#1a4d1a",
      border: "1px solid #39ff14",
      color: "#39ff14"
    },
    messageError: {
      background: "#4d1a1a",
      border: "1px solid #ff4444",
      color: "#ff4444"
    },
    backButton: {
      background: "transparent",
      border: "1px solid #ff6600",
      borderRadius: "6px",
      padding: "8px 16px",
      color: "#ff6600",
      fontSize: "0.9rem",
      fontFamily: "inherit",
      cursor: "pointer",
      outline: "none",
      transition: "all 0.3s",
      marginBottom: "20px"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/')}
        >
          ← Back to Homepage
        </button>
        
        <h1 style={styles.title}>Chronos: The Dawn</h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Login to continue your adventure' : 'Create your account'}
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                required
                placeholder="Enter your email"
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={styles.input}
              required
              placeholder="Enter your username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={styles.input}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading && styles.buttonDisabled)
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <button
          style={styles.toggleButton}
          onClick={() => {
            setIsLogin(!isLogin);
            setFormData({ username: '', email: '', password: '' });
            setMessage('');
          }}
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>

        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 