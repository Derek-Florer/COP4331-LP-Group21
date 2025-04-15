import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [message, setMessage] = React.useState('');
    const [loginName, setLoginName] = React.useState('');
    const [loginPassword, setPassword] = React.useState('');

    const navigate = useNavigate();
    const handleSignup = () => {
        navigate('/signup');
      };

    async function doLogin(event: any): Promise<void> {
        event.preventDefault();

        var obj = { login: loginName, password: loginPassword };
        var js = JSON.stringify(obj);
        try {
            const response = await fetch('http://localhost:5000/api/login',
                {
                    method: 'POST', body: js, headers: {
                        'Content-Type':
                            'application/json'
                    }
                });
            var res = JSON.parse(await response.text());
            if (res.id <= 0) {
                setMessage('User/Password combination incorrect');
            }
            else {
                var user =
                    { firstName: res.firstName, lastName: res.lastName, id: res.id }
                localStorage.setItem('user_data', JSON.stringify(user));
                setMessage('');
                window.location.href = '/dashboard';
            }
        }
        catch (error: any) {
            alert(error.toString());
            return;
        }
    }

    function handleSetLoginName(e: any): void {
        setLoginName(e.target.value);
    }

    function handleSetPassword(e: any): void {
        setPassword(e.target.value);
    }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">POOS FINANCE</h1>
        <form onSubmit={doLogin} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            //value={email}
            onChange={handleSetLoginName}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            //value={password}
            onChange={handleSetPassword}
            required
          />

          <button type="submit">Login</button>
        </form>
        <p className="signup-text">
          Don’t have an account? <span className="signup-link" onClick={handleSignup}>Sign up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;