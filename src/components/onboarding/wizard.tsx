'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, User, BookOpen, Award, Compass, Plus, X, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    level: 'class_12', // class_10, class_11, class_12, ug, pg, graduate
    state: 'Maharashtra',
    category: 'general', // general, obc, sc, st, ews
    gender: 'male',
    income: '3_6', // below_1, 1_3, 3_6, 6_10, above_10 (LPA)
    stream: 'pcm', // pcm, pcb, commerce, arts, na
    score10: '',
    score12: '',
    currentCollege: '',
    currentBranch: '',
    currentCgpa: '',
    exams: [] as string[],
    examScores: {} as Record<string, { score: string; rank: string }>,
    interests: [] as string[],
    workStyle: 'collaborative', // collaborative, individual, creative, technical
    careerGoal: '',
    locationPreference: 'anywhere',
  });

  // Pre-populate from signup draft
  useEffect(() => {
    const draft = localStorage.getItem('signup_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
        }));
      } catch (e) {
        console.error('Failed to parse signup draft', e);
      }
    }
  }, []);

  const availableInterests = [
    'Software Engineering', 'Artificial Intelligence', 'Data Science', 'UI/UX Design',
    'Product Management', 'Medicine & Surgery', 'Biotechnology', 'Business Analytics',
    'Finance & Trading', 'Entrepreneurship', 'Corporate Law', 'Creative Writing',
    'Core Engineering', 'Pure Sciences', 'Digital Marketing'
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    // Save locally first
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('student_profile', JSON.stringify(formData));

    // Cleanup signup draft
    localStorage.removeItem('signup_draft');

    // Navigate immediately — don't wait for backend
    router.push('/dashboard');

    // Sync to backend in background (fire-and-forget with timeout)
    try {
      const token = localStorage.getItem('auth_token') || 'guest-token';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      fetch(`${apiUrl}/api/v1/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
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
          exam_scores: formData.examScores,
          interests: formData.interests,
          preferred_work_style: formData.workStyle,
          career_goal: formData.careerGoal || null,
          location_preference: formData.locationPreference,
        }),
      }).then(() => clearTimeout(timeout))
        .catch((err) => { clearTimeout(timeout); console.warn('Backend sync failed:', err); });
    } catch (err) {
      console.warn('Backend sync failed, profile saved locally.', err);
    }
  };

  const toggleExam = (exam: string) => {
    setFormData((prev) => {
      const exams = prev.exams.includes(exam)
        ? prev.exams.filter((e) => e !== exam)
        : [...prev.exams, exam];
      return { ...prev, exams };
    });
  };

  const handleExamScoreChange = (exam: string, field: 'score' | 'rank', value: string) => {
    setFormData((prev) => {
      const current = prev.examScores[exam] || { score: '', rank: '' };
      return {
        ...prev,
        examScores: {
          ...prev.examScores,
          [exam]: { ...current, [field]: value },
        },
      };
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const progressValue = (step / totalSteps) * 100;

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl p-6 md:p-10 flex flex-col gap-8">
      {/* Wizard Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Sparkles className="h-5 w-5" />
            <span>Profile Wizard</span>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
        <Progress value={progressValue} className="h-1.5" />
      </div>

      {/* Steps Content */}
      <div className="min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Basic Information
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Let us know some background details to filter eligibility rules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={formData.name}
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
                      value={formData.email}
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Current Level</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="class_10">Class 10 Student</option>
                    <option value="class_11">Class 11 Student</option>
                    <option value="class_12">Class 12 Student (Board / Exam Prep)</option>
                    <option value="ug">Undergraduate Student (B.Tech, B.Sc, etc.)</option>
                    <option value="graduate">Fresh Graduate / Job Seeker</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">State of Domicile</label>
                  <Input
                    placeholder="e.g. Maharashtra, Uttar Pradesh"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.category}
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
                  <label className="text-xs font-semibold text-muted-foreground">Gender</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Family Income (LPA)</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  >
                    <option value="below_1">Below ₹1 Lakh</option>
                    <option value="1_3">₹1 Lakh - ₹3 Lakh</option>
                    <option value="3_6">₹3 Lakh - ₹6 Lakh</option>
                    <option value="6_10">₹6 Lakh - ₹10 Lakh</option>
                    <option value="above_10">Above ₹10 Lakh</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Academic Profile
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Academics play a big role in college cutoffs and scholarship matches.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Class 10 Score (%)</label>
                    <Input
                      placeholder="e.g. 92.4"
                      value={formData.score10}
                      onChange={(e) => setFormData({ ...formData, score10: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Academic Stream</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                    >
                      <option value="pcm">Science (PCM)</option>
                      <option value="pcb">Science (PCB)</option>
                      <option value="commerce">Commerce</option>
                      <option value="arts">Arts / Humanities</option>
                      <option value="na">Other</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields based on student level */}
                {(formData.level === 'class_12' || formData.level === 'ug' || formData.level === 'graduate') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Class 12 Score (%)</label>
                    <Input
                      placeholder="e.g. 88.5"
                      value={formData.score12}
                      onChange={(e) => setFormData({ ...formData, score12: e.target.value })}
                    />
                  </div>
                )}

                {(formData.level === 'ug' || formData.level === 'graduate') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/50 pt-4 mt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Current College</label>
                      <Input
                        placeholder="e.g. IIT Delhi"
                        value={formData.currentCollege}
                        onChange={(e) => setFormData({ ...formData, currentCollege: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Current Branch</label>
                      <Input
                        placeholder="e.g. Computer Science"
                        value={formData.currentBranch}
                        onChange={(e) => setFormData({ ...formData, currentBranch: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Current CGPA</label>
                      <Input
                        placeholder="e.g. 8.45"
                        value={formData.currentCgpa}
                        onChange={(e) => setFormData({ ...formData, currentCgpa: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" /> Entrance Exams & Scores
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Select exams taken and input scores to calculate college predictability.</p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2.5">
                  {['JEE Mains', 'JEE Advanced', 'NEET', 'CUET', 'GATE', 'CAT'].map((exam) => {
                    const isSelected = formData.exams.includes(exam);
                    return (
                      <button
                        key={exam}
                        type="button"
                        onClick={() => toggleExam(exam)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground shadow-md'
                            : 'border-border bg-background hover:bg-secondary'
                        }`}
                      >
                        {exam}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 mt-4 max-h-[200px] overflow-y-auto pr-2">
                  {formData.exams.map((exam) => {
                    const scoreObj = formData.examScores[exam] || { score: '', rank: '' };
                    return (
                      <div key={exam} className="grid grid-cols-3 items-center gap-4 p-3 rounded-lg border border-border bg-secondary/35">
                        <span className="text-xs font-bold">{exam}</span>
                        <Input
                          placeholder="Score (%)"
                          value={scoreObj.score}
                          onChange={(e) => handleExamScoreChange(exam, 'score', e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input
                          placeholder="CRL Rank"
                          value={scoreObj.rank}
                          onChange={(e) => handleExamScoreChange(exam, 'rank', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" /> Interests & Career Goals
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Select interests to match with AI career guidance templates.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Select Interests (Minimum 2)</label>
                  <div className="flex flex-wrap gap-2 max-h-[170px] overflow-y-auto p-1 border border-border/60 rounded-lg bg-secondary/15">
                    {availableInterests.map((interest) => {
                      const isSelected = formData.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                            isSelected
                              ? 'bg-indigo-500 text-white font-medium shadow-sm'
                              : 'bg-background hover:bg-secondary border border-border text-muted-foreground'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">What is your dream career goal? (Optional)</label>
                  <Input
                    placeholder="e.g. Become an AI researcher in healthcare"
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-border/80 pt-6 mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5 px-6"
          >
            <span>{step === totalSteps ? 'Complete Profile' : 'Next Step'}</span>
            {step === totalSteps ? <CheckCircle2 className="h-4.5 w-4.5" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
