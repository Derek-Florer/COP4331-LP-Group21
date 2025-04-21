import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

function Signup() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function doSignup(event: any): Promise<void> {
    event.preventDefault();

    const randomNumber = Math.floor(100000000 + Math.random() * 900000000);
    const obj = {
      userId: `${firstName}${lastName.charAt(0)}${randomNumber}`,
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
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 font-sans">
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="absolute inset-0 h-full z-20 flex flex-col justify-center items-center text-white p-10 sm:w-full lg:w-1/2"
      >
        <div className="space-y-6 max-w-sm text-center">
          <h2 className="text-4xl font-bold mt-4">Create Your Account</h2>
          <p className="text-md opacity-90 mt-2">
            Start managing your finance faster and better
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center bg-gray-50 dark:bg-black px-6 z-10"
      >
        <div className="w-full max-w-md mx-auto">
          <Card className="w-full shadow-lg border border-gray-200 rounded-2xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl font-semibold text-center">
                Sign Up
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Create your account to start managing your finances
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={doSignup} className="space-y-4">
                <div className="relative">
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>

                <Button type="submit" className="w-full mt-2">
                  Create Account
                </Button>

                {message && (
                  <p className="text-sm text-red-500 text-center mt-2">{message}</p>
                )}
              </form>

              <p className="text-sm text-center mt-6 text-muted-foreground">
                Already have an account?{' '}
                <span
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() => window.location.href = '/'}
                >
                  Log in
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;