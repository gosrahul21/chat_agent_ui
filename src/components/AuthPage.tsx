import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <Signup onSwitchToLogin={() => setIsLogin(true)} />
  );
}

