import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/chat');
    }
  };
  
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input rounded-t-md rounded-b-none"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input rounded-t-none rounded-b-md"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
} 