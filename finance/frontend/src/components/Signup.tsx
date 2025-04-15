import React, { useState } from 'react';

function Signup() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function doSignup(event: any): Promise<void> {
    event.preventDefault();

    const obj = {
      userId: `${firstName}${lastName.charAt(0)}`,
      firstName: firstName,
      lastName: lastName,
      login: email,
      password: password
    };

    const js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());

      if (res.error) {
        setMessage(res.error);
      } else {
        alert('Account created! Please sign in');
        window.location.href = '/';
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Sign Up</h1>
        <form onSubmit={doSignup} className="signup-form">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" onChange={(e) => setFirstName(e.target.value)} required />

          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" onChange={(e) => setLastName(e.target.value)} required />

          <label htmlFor="email">Email</label>
          <input id="email" type="email" onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Create Account</button>
        </form>

        {message && <p className="error-message">{message}</p>}
        <p className="login-text">
          Already have an account? <a href="/" className="login-link">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;