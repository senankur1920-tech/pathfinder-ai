'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Map, BookOpen, Clock, Code, CheckSquare, Search, Award, CheckCircle2, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAuthToken } from '@/lib/auth';

interface RoadmapTask {
  name: string;
  duration: string;
  resourceName: string;
  resourceUrl: string;
  cost: string;
  project: string;
}

interface RoadmapPhase {
  name: string;
  duration: string;
  tasks: RoadmapTask[];
}

function RoadmapInner() {
  const searchParams = useSearchParams();
  const searchTarget = searchParams.get('target') || 'ml-engineer';

  const [careerTitle, setCareerTitle] = useState('Machine Learning Engineer');
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [skillsGap, setSkillsGap] = useState<{ name: string; current: number; required: number }[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Set career target details
    const targetMap: Record<string, { title: string; phases: RoadmapPhase[]; gap: any[] }> = {
      'ml-engineer': {
        title: 'Machine Learning Engineer',
        phases: [
          {
            name: 'Phase 1: Foundations (Month 1-2)',
            duration: '8 weeks',
            tasks: [
              { name: 'Python Programming Masterclass', duration: '3 weeks', resourceName: 'CS50P (Harvard - Free)', resourceUrl: 'https://cs50.harvard.edu/python', cost: 'Free', project: 'CLI Task Planner' },
              { name: 'Linear Algebra & Statistics', duration: '3 weeks', resourceName: 'Imperial College London (Coursera)', resourceUrl: 'https://www.coursera.org/specializations/mathematics-machine-learning', cost: 'Free Audit', project: 'Statistical Data Analyzer' },
              { name: 'Git & Version Control', duration: '2 weeks', resourceName: 'GitHub Skills Tutorials', resourceUrl: 'https://skills.github.com', cost: 'Free', project: 'Open-Source Pull Request Curation' }
            ]
          },
          {
            name: 'Phase 2: Core ML Models (Month 3-4)',
            duration: '8 weeks',
            tasks: [
              { name: 'Classical Machine Learning Algorithms', duration: '4 weeks', resourceName: 'Andrew Ng ML Course (Stanford)', resourceUrl: 'https://www.coursera.org/specializations/machine-learning-introduction', cost: 'Free Audit', project: 'Housing Price Predictor' },
              { name: 'Data Manipulation & Analysis', duration: '4 weeks', resourceName: 'Pandas & NumPy Cookbook', resourceUrl: 'https://kaggle.com/learn', cost: 'Free', project: 'Kaggle Titanic Prediction Challenge' }
            ]
          },
          {
            name: 'Phase 3: Deep Learning & Deployment (Month 5-6)',
            duration: '8 weeks',
            tasks: [
              { name: 'Neural Networks & PyTorch', duration: '4 weeks', resourceName: 'PyTorch Official Tutorials', resourceUrl: 'https://pytorch.org/tutorials', cost: 'Free', project: 'Image Classifier App' },
              { name: 'LLM Fine-tuning & APIs', duration: '4 weeks', resourceName: 'Gemini Developer Docs', resourceUrl: 'https://ai.google.dev', cost: 'Free', project: 'PathFinder AI Custom Coach Mock API' }
            ]
          }
        ],
        gap: [
          { name: 'Python Programming', current: 35, required: 85 },
          { name: 'Mathematics & Stats', current: 40, required: 90 },
          { name: 'Data Manipulation', current: 20, required: 80 },
          { name: 'Deep Learning', current: 5, required: 75 },
          { name: 'MLOps & Deployment', current: 10, required: 70 },
        ]
      },
      'systems-architect': {
        title: 'Software Systems Architect',
        phases: [
          {
            name: 'Phase 1: Advanced Backend & DSA (Month 1-2)',
            duration: '8 weeks',
            tasks: [
              { name: 'Data Structures & Algorithms', duration: '4 weeks', resourceName: 'Striver A2Z DSA Sheet', resourceUrl: 'https://takeuforward.org', cost: 'Free', project: 'Graph Search Visualizer' },
              { name: 'High Performance Node.js / Go', duration: '4 weeks', resourceName: 'Go Programming Bootcamps', resourceUrl: 'https://go.dev/doc/tutorial', cost: 'Free', project: 'Concurrency Web Scraper' }
            ]
          },
          {
            name: 'Phase 2: System Design & Databases (Month 3-4)',
            duration: '8 weeks',
            tasks: [
              { name: 'System Design Foundations', duration: '4 weeks', resourceName: 'ByteByteGo System Design primer', resourceUrl: 'https://bytebytego.com', cost: 'Free articles', project: 'Chat Application Architecture' },
              { name: 'Database Caching & Sharding', duration: '4 weeks', resourceName: 'Redis University courses', resourceUrl: 'https://university.redis.com', cost: 'Free', project: 'Fast Key-Value API Cache' }
            ]
          }
        ],
        gap: [
          { name: 'Programming Languages', current: 60, required: 90 },
          { name: 'DSA Foundations', current: 50, required: 85 },
          { name: 'System Design', current: 15, required: 85 },
          { name: 'Database Design', current: 30, required: 80 },
          { name: 'Docker / Kubernetes', current: 10, required: 75 },
        ]
      }
    };

    const targetDetails = targetMap[searchTarget] || targetMap['ml-engineer'];

    // 2. Load checked items
    const savedProgress = localStorage.getItem(`progress_${searchTarget}`);
    if (savedProgress) {
      try {
        setCompletedTasks(JSON.parse(savedProgress));
      } catch (e) {
        console.error(e);
      }
    }

    const fetchRoadmap = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const targetTitle = searchTarget === 'ml-engineer' ? 'Machine Learning Engineer' : 'Software Systems Architect';
        const response = await fetch(`${apiUrl}/api/v1/skills/roadmap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            target_career: targetTitle
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.roadmap) {
            const mappedPhases: RoadmapPhase[] = [
              {
                name: data.roadmap.foundations.title + ' (' + data.roadmap.foundations.duration + ')',
                duration: data.roadmap.foundations.duration,
                tasks: data.roadmap.foundations.steps.map((s: any, idx: number) => ({
                  name: s.title,
                  duration: '2 weeks',
                  resourceName: s.resources[0] || 'Official Docs',
                  resourceUrl: s.resources[1] || 'https://google.com',
                  cost: 'Free',
                  project: s.description
                }))
              },
              {
                name: data.roadmap.core.title + ' (' + data.roadmap.core.duration + ')',
                duration: data.roadmap.core.duration,
                tasks: data.roadmap.core.steps.map((s: any, idx: number) => ({
                  name: s.title,
                  duration: '3 weeks',
                  resourceName: s.resources[0] || 'Official Docs',
                  resourceUrl: s.resources[1] || 'https://google.com',
                  cost: 'Free',
                  project: s.description
                }))
              },
              {
                name: data.roadmap.advanced.title + ' (' + data.roadmap.advanced.duration + ')',
                duration: data.roadmap.advanced.duration,
                tasks: data.roadmap.advanced.steps.map((s: any, idx: number) => ({
                  name: s.title,
                  duration: '3 weeks',
                  resourceName: s.resources[0] || 'Official Docs',
                  resourceUrl: s.resources[1] || 'https://google.com',
                  cost: 'Free',
                  project: s.description
                }))
              }
            ];

            const mappedGap = data.skill_gaps.labels.map((lbl: string, idx: number) => ({
              name: lbl,
              current: data.skill_gaps.current[idx] || 30,
              required: data.skill_gaps.target[idx] || 85
            }));

            setCareerTitle(data.target_career);
            setPhases(mappedPhases);
            setSkillsGap(mappedGap);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend skills roadmap failed. Using mock defaults.", err);
      }
      setCareerTitle(targetDetails.title);
      setPhases(targetDetails.phases);
      setSkillsGap(targetDetails.gap);
      setLoading(false);
    };

    fetchRoadmap();
  }, [searchTarget]);

  const toggleTask = (taskName: string) => {
    setCompletedTasks((prev) => {
      const next = prev.includes(taskName) ? prev.filter((t) => t !== taskName) : [...prev, taskName];
      localStorage.setItem(`progress_${searchTarget}`, JSON.stringify(next));
      return next;
    });
  };

  const totalTasksCount = phases.reduce((acc, curr) => acc + curr.tasks.length, 0);
  const completedCount = completedTasks.length;
  const roadmapProgress = totalTasksCount > 0 ? (completedCount / totalTasksCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Map className="h-7 w-7 text-primary" /> Skill Roadmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Follow customized week-by-week learning roadmaps targeting <span className="text-primary font-semibold">{careerTitle}</span>.
          </p>
        </div>

        {/* Roadmap selection */}
        <div className="flex gap-1.5 p-1 border border-border bg-card/60 rounded-lg w-fit text-xs">
          <Link href="/skills?target=ml-engineer">
            <button className={`px-3 py-1.5 rounded-md font-semibold transition-all ${searchTarget === 'ml-engineer' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              ML Engineer
            </button>
          </Link>
          <Link href="/skills?target=systems-architect">
            <button className={`px-3 py-1.5 rounded-md font-semibold transition-all ${searchTarget === 'systems-architect' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Systems Architect
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Generating skill tree node charts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Progress & Skill Gap charts */}
          <div className="lg:col-span-1 space-y-6">
            {/* Completion metrics */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Progress Tracker</CardTitle>
                <CardDescription className="text-xs">Complete checklist steps to increase roadmap score.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Tasks Completed</span>
                  <span className="text-primary">{completedCount} of {totalTasksCount}</span>
                </div>
                <Progress value={roadmapProgress} className="h-2" />

                {roadmapProgress === 100 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg flex items-start gap-2 text-xs">
                    <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0" />
                    <span>Incredible job! You completed the learning roadmap. You are job-ready!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom bar chart representing skills gap */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Skill Gap Analysis</CardTitle>
                <CardDescription className="text-xs">Comparison between your current level and targets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {skillsGap.map((item) => (
                    <div key={item.name} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Current: {item.current}% / Target: {item.required}%
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                        {/* Required target bar (semi-transparent) */}
                        <div
                          className="absolute top-0 left-0 h-full bg-primary/20 transition-all duration-300"
                          style={{ width: `${item.required}%` }}
                        />
                        {/* Current level bar */}
                        <div
                          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                          style={{ width: `${item.current}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-3 mt-2">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Current</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary/20" /> Required Target</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Columns: Phase Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {phases.map((phase, pIdx) => (
              <div key={pIdx} className="space-y-3">
                <div className="p-3 bg-secondary/35 border border-border/80 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{phase.name}</span>
                  <Badge variant="outline" className="text-[10px]">{phase.duration}</Badge>
                </div>

                <div className="flex flex-col gap-4 pl-4 border-l border-border ml-3">
                  {phase.tasks.map((task, tIdx) => {
                    const isCompleted = completedTasks.includes(task.name);
                    return (
                      <div key={tIdx} className="relative group">
                        {/* Node timeline pointer */}
                        <button
                          onClick={() => toggleTask(task.name)}
                          className={`absolute -left-[27px] top-1.5 h-5.5 w-5.5 rounded-full border bg-card flex items-center justify-center transition-all ${
                            isCompleted ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:border-foreground'
                          }`}
                          aria-label="Toggle Complete"
                        >
                          {isCompleted ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-border" />}
                        </button>

                        <Card className={`hover:border-primary/20 transition-all shadow-sm ${isCompleted ? 'border-primary/20 bg-primary/[0.01]' : ''}`}>
                          <CardHeader className="p-4 pb-2.5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <CardTitle className="text-sm font-semibold">{task.name}</CardTitle>
                                <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3 text-primary" /> {task.duration}</span>
                                  <span>&bull;</span>
                                  <span className="flex items-center gap-0.5"><BookOpen className="h-3 w-3 text-primary" /> {task.resourceName}</span>
                                </div>
                              </div>

                              <a href={task.resourceUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] font-semibold text-primary flex items-center gap-1 hover:bg-primary/5">
                                  <span>View Class</span>
                                </Button>
                              </a>
                            </div>
                          </CardHeader>

                          <CardContent className="p-4 pt-0 text-xs">
                            <div className="flex items-start gap-1.5 p-2 rounded bg-secondary/35 border border-border/50 mt-1">
                              <Code className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-foreground text-[11px] block">Suggested Project milestone:</span>
                                <span className="text-muted-foreground text-[10.5px] leading-relaxed block mt-0.5">{task.project}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillRoadmapPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">Generating skill tree node charts...</div>}>
      <RoadmapInner />
    </Suspense>
  );
}
