'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Trash2, Download, User, BookOpen, Sun, Moon, Mail, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAuthToken } from '@/lib/auth';

export default function ProfileSettingsPage() {
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    level: 'class_12',
    state: '',
    category: 'general',
    gender: 'male',
    income: '3_6',
    stream: 'pcm',
    score10: '',
    score12: '',
    currentCollege: '',
    currentBranch: '',
    currentCgpa: '',
    exams: [],
    interests: [],
    careerGoal: '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // 1. Get profile
    const raw = localStorage.getItem('student_profile');
    if (raw) {
      try {
        setFormData(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Get theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setTheme(savedTheme || 'dark');
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    // Save locally
    localStorage.setItem('student_profile', JSON.stringify(formData));

    // Sync to backend
    try {
      const token = getAuthToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/v1/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          current_level: formData.level,
          state: formData.state,
          category: formData.category,
          gender: formData.gender,
          income_range: formData.income,
          stream: formData.stream,
          class_10_score: formData.score10 ? parseFloat(formData.score10) : null,
          class_12_score: formData.score12 ? parseFloat(formData.score12) : null,
          current_college: formData.currentCollege || null,
          current_branch: formData.currentBranch || null,
          current_cgpa: formData.currentCgpa ? parseFloat(formData.currentCgpa) : null,
          exam_scores: formData.examScores || {},
          interests: formData.interests || [],
          preferred_work_style: formData.workStyle || 'collaborative',
          career_goal: formData.careerGoal || null,
          location_preference: formData.locationPreference || 'anywhere',
        }),
      });
    } catch (err) {
      console.warn('Backend sync failed on settings save.', err);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'pathfinder_profile.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your profile data? This will reset the onboarding steps.')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" /> Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your academic records, edit counseling parameters, and configure theme aesthetics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Profile Forms */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <Input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">State of Domicile</label>
                <Input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.category || 'general'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="general">General (UR)</option>
                  <option value="obc">OBC-NCL</option>
                  <option value="sc">Scheduled Caste (SC)</option>
                  <option value="st">Scheduled Tribe (ST)</option>
                  <option value="ews">General-EWS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Family Income (LPA)</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.income || '3_6'}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                >
                  <option value="below_1">Below ₹1 Lakh</option>
                  <option value="1_3">₹1 Lakh - ₹3 Lakh</option>
                  <option value="3_6">₹3 Lakh - ₹6 Lakh</option>
                  <option value="6_10">₹6 Lakh - ₹10 Lakh</option>
                  <option value="above_10">Above ₹10 Lakh</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-primary" /> Academic Records
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class 10 Score (%)</label>
                <Input
                  type="text"
                  value={formData.score10 || ''}
                  onChange={(e) => setFormData({ ...formData, score10: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Stream</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={formData.stream || 'pcm'}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                >
                  <option value="pcm">Science (PCM)</option>
                  <option value="pcb">Science (PCB)</option>
                  <option value="commerce">Commerce</option>
                  <option value="arts">Arts / Humanities</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class 12 Score (%)</label>
                <Input
                  type="text"
                  value={formData.score12 || ''}
                  onChange={(e) => setFormData({ ...formData, score12: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Dream Career Goal</label>
                <Input
                  type="text"
                  value={formData.careerGoal || ''}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  placeholder="e.g. Artificial Intelligence Specialist"
                />
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/60 pt-4 flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 h-10 px-6" disabled={saving}>
                <Save className="h-4.5 w-4.5" />
                <span>{saving ? 'Saving...' : saved ? 'Changes Saved!' : 'Save Parameters'}</span>
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Right 1 Column: Configurations & Exports */}
        <div className="space-y-6">
          {/* Theme card config */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Appearance</CardTitle>
              <CardDescription className="text-xs">Adjust interface themes for readability.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3 pt-0">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className={`flex-grow flex items-center justify-center gap-1.5 h-10 ${
                  theme === 'light' ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Sun className="h-4.5 w-4.5" />
                <span>Light</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className={`flex-grow flex items-center justify-center gap-1.5 h-10 ${
                  theme === 'dark' ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Moon className="h-4.5 w-4.5" />
                <span>Dark</span>
              </Button>
            </CardContent>
          </Card>

          {/* Backup data config */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Data Management</CardTitle>
              <CardDescription className="text-xs">Manage local files and storage metadata.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-1.5 h-10"
              >
                <Download className="h-4.5 w-4.5 text-primary" />
                <span>Export Profile (JSON)</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-1.5 h-10 text-destructive border-destructive/20 hover:bg-destructive/5"
              >
                <Trash2 className="h-4.5 w-4.5" />
                <span>Delete Local Profile</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
