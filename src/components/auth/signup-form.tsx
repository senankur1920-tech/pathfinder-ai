'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    // basic strength score
    let score = 0;
    if (val.length >= 6) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    setPasswordStrength(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (!email && !phone) {
      setError('Please provide at least an email address or mobile number.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || null,
          phone: phone || null,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_id', data.user_id);
        // Store draft signup info for onboarding pre-population
        localStorage.setItem('signup_draft', JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
        }));
        router.push('/onboarding');
      } else {
        const errData = await response.json().catch(() => null);
        setError(errData?.detail || 'Signup failed. Please try again.');
      }
    } catch {
      // Fallback to mock if backend is offline
      const mockId = crypto.randomUUID?.() || `${Date.now()}`;
      localStorage.setItem('auth_token', `mock-${mockId}`);
      localStorage.setItem('signup_draft', JSON.stringify({ name, email, phone }));
      router.push('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    localStorage.setItem('auth_token', `mock-google-${Date.now()}`);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/onboarding');
    }, 1000);
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 md:p-8 bg-card/45 backdrop-blur-md rounded-2xl border border-border shadow-xl">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Start your personalized AI career guidance journey today.
        </p>
      </div>

      {/* Google Button */}
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2.5 h-11"
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.16 2.709 1.136 6.645l4.13 3.12z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.077.733-2.458 1.182-4.04 1.182a7.077 7.077 0 0 1-6.734-4.855L1.136 14.8c2.024 3.936 6.133 6.645 10.864 6.645 3.127 0 5.964-1.018 8.04-2.827l-4-3.273z"
          />
          <path
            fill="#4285F4"
            d="M23.864 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.69A5.727 5.727 0 0 1 16.04 15.345l4 3.273c2.336-2.155 3.824-5.327 3.824-8.913z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 11.673a7.032 7.032 0 0 1 0-2.09l-4.13-3.12A11.96 11.96 0 0 0 0 12c0 2.027.505 3.936 1.136 5.682l4.13-4.009z"
          />
        </svg>
        <span>Sign up with Google</span>
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative px-3 text-xs uppercase bg-card text-muted-foreground">Or register email</span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-destructive/15 text-destructive rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Mobile Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
          </div>
          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="space-y-1 mt-1">
              <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden bg-secondary">
                {[...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-full flex-grow transition-all duration-300 ${
                      idx < passwordStrength
                        ? passwordStrength <= 2
                          ? 'bg-rose-500'
                          : passwordStrength === 3
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {passwordStrength <= 1 && 'Weak'}
                {passwordStrength === 2 && 'Fair'}
                {passwordStrength === 3 && 'Good'}
                {passwordStrength === 4 && 'Excellent'}
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/95 text-white h-11 flex items-center justify-center gap-2 mt-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
