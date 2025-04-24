import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [startShrink, setStartShrink] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const enterTimer = setTimeout(() => setStartShrink(true), 1000);
    const loginTimer = setTimeout(() => setShowLogin(true), 1800);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(loginTimer);
    };
  }, []);

  const handleSignup = () => navigate('/signup');

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: js,
      });
      const res = await response.json();
      if (response.ok) {
        localStorage.setItem('token', res.token);
        setIsLoggingIn(true);

        setTimeout(() => {
          navigate('/dashboard');
        }, 800); // match the animation duration
      } else {
        setMessage('Invalid credentials');
      }
    } catch (err: any) {
      setMessage("Server error. Try again.");
    }
  };

  const userDataString = localStorage.getItem('token');
  if (userDataString) {
    try {
      navigate('/dashboard');
    } catch (error) {
      console.error('No local user data', error);
    }
  }

  return (
    <motion.div
      className="relative w-screen h-screen overflow-hidden font-sans bg-gradient-to-br from-blue-600 to-purple-700"
      animate={isLoggingIn ? { x: '-100%' } : { x: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: startShrink ? "50%" : "100%",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute inset-0 h-full z-20 flex flex-col justify-center items-center text-white p-10"
      >
        <div className="space-y-6 max-w-sm text-center">
          <img
            src="/manageYourFinances.jpg"
            alt="Finance Illustration"
            className="w-full h-auto rounded-xl shadow-lg"
          />
          <div>
            <h2 className="text-4xl font-bold mt-4">SUPER AWESOME FINANCE MANAGER!</h2>
            <p className="text-md opacity-90 mt-2">
              Start managing your finance faster and better
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center bg-gray-50 dark:bg-black px-6 z-10"
          >
            <div className="w-full max-w-md mx-auto">
              <Card className="w-full shadow-lg border border-gray-200 rounded-2xl">
                <CardHeader className="pb-0">
                  <CardTitle className="text-2xl font-semibold text-center">
                    Welcome back!
                  </CardTitle>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Start managing your finance faster and better
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={doLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
                        value={loginPassword}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10"
                      />
                      <div
                        className="absolute right-3 top-2.5 cursor-pointer text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`w-full mt-2 !bg-blue-700 !text-white hover:!bg-blue-800 transition-colors duration-300 
                      `}
                    >
                      Sign In
                    </Button>


                    {message && (
                      <p className="text-sm text-red-500 text-center mt-2">{message}</p>
                    )}
                  </form>

                  <p className="text-sm text-center mt-6 text-muted-foreground">
                    Don’t have an account?{" "}
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={handleSignup}
                    >
                      Sign up
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}