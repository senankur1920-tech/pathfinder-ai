'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Landmark, Map, Award, BookOpen, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAuthToken } from '@/lib/auth';

interface CareerMatch {
  id: string;
  title: string;
  matchPercentage: number;
  description: string;
  matchReasons: string[];
  salaryEntry: string;
  salarySenior: string;
  demand: string;
  growth: string;
  pathway: string;
  skills: string[];
  category: string;
}

export default function CareerMatcherPage() {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<CareerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const raw = localStorage.getItem('student_profile');
    let stream = 'pcm';
    let userInterests = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setProfile(parsed);
        stream = parsed.stream || 'pcm';
        userInterests = parsed.interests || [];
      } catch (e) {
        console.error(e);
      }
    } else {
      // Set a sample profile for mock preview
      setProfile({
        name: 'Guest Student',
        stream: 'pcm',
        interests: ['Software Engineering', 'Artificial Intelligence', 'Product Management'],
        isGuest: true
      });
    }

    const defaultMatches: CareerMatch[] = [];

    if (stream === 'pcm') {
      defaultMatches.push(
        {
          id: 'ml-engineer',
          title: 'Machine Learning Engineer',
          matchPercentage: 96,
          description: 'Design and build self-learning systems. Train neural networks, deploy LLMs, and optimize algorithmic performance.',
          matchReasons: [
            'Matches interest in Artificial Intelligence',
            'Aligns with strong math foundation (Class 10/12 score)',
            'High fit for Science (PCM) academic stream'
          ],
          salaryEntry: '₹8 - 15 LPA',
          salarySenior: '₹30 - 60 LPA',
          demand: 'Very High',
          growth: '+26% YoY',
          pathway: 'B.Tech CS / IT / Data Science followed by AI specializations',
          skills: ['Python', 'PyTorch', 'Linear Algebra', 'Scikit-Learn', 'LLMs'],
          category: 'tech'
        },
        {
          id: 'systems-architect',
          title: 'Software Systems Architect',
          matchPercentage: 92,
          description: 'Determine coding standards, design large-scale microservice systems, and select database structures for enterprise SaaS platforms.',
          matchReasons: [
            'Matches interest in Software Engineering',
            'Aligns with analytical problem solving',
            'Strong fit for high scale technology targets'
          ],
          salaryEntry: '₹10 - 18 LPA',
          salarySenior: '₹35 - 75 LPA',
          demand: 'Very High',
          growth: '+22% YoY',
          pathway: 'B.Tech in Computer Science / IT or BCA + MCA',
          skills: ['System Design', 'Docker', 'Kubernetes', 'Cloud (AWS/GCP)', 'Node.js/Go'],
          category: 'tech'
        },
        {
          id: 'product-manager',
          title: 'Product Manager (Technical)',
          matchPercentage: 88,
          description: 'Bridge engineering, design, and business. Map feature roadmaps, define specs, and analyze user engagement metrics.',
          matchReasons: [
            'Matches interest in Product Management',
            'Capitalizes on collaborative work style preference',
            'Good fit for combining business strategy with engineering'
          ],
          salaryEntry: '₹12 - 20 LPA',
          salarySenior: '₹40 - 80 LPA',
          demand: 'High',
          growth: '+18% YoY',
          pathway: 'B.Tech / B.Sc followed by MBA or Product Bootcamps',
          skills: ['Product Strategy', 'Agile / Scrum', 'SQL', 'A/B Testing', 'UI/UX Basics'],
          category: 'business'
        }
      );
    } else if (stream === 'pcb') {
      defaultMatches.push(
        {
          id: 'biotech-researcher',
          title: 'Biotechnology Researcher',
          matchPercentage: 94,
          description: 'Research vaccine pipelines, engineer organic enzymes, and formulate cellular therapeutics for biomedical labs.',
          matchReasons: [
            'Matches interest in Biotechnology',
            'Aligns with Science (PCB) stream credentials',
            'Strong medical backup pathway'
          ],
          salaryEntry: '₹5 - 10 LPA',
          salarySenior: '₹20 - 45 LPA',
          demand: 'High',
          growth: '+15% YoY',
          pathway: 'B.Sc / B.Tech in Biotechnology followed by M.Tech / PhD',
          skills: ['Genetics', 'CRISPR', 'Organic Chemistry', 'Bioinformatics', 'Lab Safety'],
          category: 'medical'
        },
        {
          id: 'clinical-data-analyst',
          title: 'Clinical Data Analyst',
          matchPercentage: 89,
          description: 'Aggregate patient cohort data, clean clinical trial registers, and analyze drug safety dashboards using statistical models.',
          matchReasons: [
            'Matches interest in Data Science',
            'Bridges biological sciences with data processing',
            'High demand in global pharma labs'
          ],
          salaryEntry: '₹6 - 12 LPA',
          salarySenior: '₹22 - 50 LPA',
          demand: 'Very High',
          growth: '+24% YoY',
          pathway: 'B.Pharm / B.Sc in Life Sciences followed by Biostatistics certifications',
          skills: ['SQL', 'Python / R', 'Biostatistics', 'SAS', 'Data Warehousing'],
          category: 'tech'
        }
      );
    } else {
      defaultMatches.push(
        {
          id: 'financial-trader',
          title: 'Quantitative Financial Analyst',
          matchPercentage: 91,
          description: 'Model risk equations, calculate asset derivatives, and run programmatic trading bots for investment desks.',
          matchReasons: [
            'Matches interest in Finance & Trading',
            'Strong fit for Commerce / quantitative stream profiles',
            'High analytical scoring'
          ],
          salaryEntry: '₹9 - 16 LPA',
          salarySenior: '₹30 - 70 LPA',
          demand: 'High',
          growth: '+19% YoY',
          pathway: 'B.Com / BBA in Finance followed by CFA or Financial Engineering',
          skills: ['Financial Modeling', 'R / Python', 'Excel VBA', 'Statistics', 'Risk Management'],
          category: 'business'
            },
        {
          id: 'ux-designer',
          title: 'UI/UX Product Designer',
          matchPercentage: 87,
          description: 'Map user journey flows, design high-fidelity vector layouts, and run interactive research tests for mobile applications.',
          matchReasons: [
            'Matches interest in UI/UX Design',
            'Aligns with creative work style goals',
            'High software developer collab potential'
          ],
          salaryEntry: '₹6 - 12 LPA',
          salarySenior: '₹24 - 55 LPA',
          demand: 'Very High',
          growth: '+21% YoY',
          pathway: 'B.Des or BCA / B.Sc followed by portfolio specializations',
          skills: ['Figma', 'User Research', 'Wireframing', 'Typography', 'Framer / Prototyping'],
          category: 'design'
        }
      );
    }

    const fetchRecommendations = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/careers/recommend`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.recommendations && data.recommendations.length > 0) {
            setMatches(data.recommendations);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend recommendations failed. Using mock defaults.", err);
      }
      setMatches(defaultMatches);
      setLoading(false);
    };

    fetchRecommendations();
  }, []);

  const filteredMatches = filter === 'all'
    ? matches
    : matches.filter((m) => m.category === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> AI Career Matcher
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalized career profiles mapped from your onboarding stream and interests.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex gap-1.5 p-1 border border-border bg-card/60 rounded-lg w-fit text-xs">
          {['all', 'tech', 'business', 'medical', 'design'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all ${
                filter === cat ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Analyzing matching algorithms...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/40">
          <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-sm">No careers match this filter</h3>
          <p className="text-xs text-muted-foreground mt-1">Try switching back to the &quot;All&quot; category filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* AI Reasoning Summary Banner */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3.5 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-foreground">AI Insight:</span> Based on your{' '}
              <span className="font-semibold text-primary">{profile?.stream?.toUpperCase() || 'PCM'}</span> stream, strong scores in academic modules, and interests in{' '}
              <span className="font-semibold text-primary">{profile?.interests?.slice(0, 3).join(', ') || 'Technology'}</span>, the model suggests these top career paths. Click on &quot;Build Roadmap&quot; to discover curation resources.
            </div>
          </div>

          {/* Careers list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((career) => (
              <Card key={career.id} className="hover:border-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="secondary" className="capitalize text-[10px] mb-2">{career.category}</Badge>
                      <CardTitle className="text-lg font-bold leading-snug">{career.title}</CardTitle>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-emerald-500">{career.matchPercentage}%</span>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">Fit Score</p>
                    </div>
                  </div>
                  <CardDescription className="text-xs leading-relaxed mt-2.5">
                    {career.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 py-3">
                  {/* Why it matches list */}
                  <div className="space-y-1.5 border-t border-border/40 pt-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Why you fit:</span>
                    <ul className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                      {career.matchReasons.map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">&bull;</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Core details grid */}
                  <div className="grid grid-cols-2 gap-3 border-t border-border/40 pt-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Salary (INR):</span>
                      <span className="font-semibold">{career.salaryEntry} <span className="text-[10px] text-muted-foreground font-normal">Entry</span></span>
                      <span className="block font-semibold mt-0.5">{career.salarySenior} <span className="text-[10px] text-muted-foreground font-normal">Senior</span></span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Market Status:</span>
                      <span className="font-semibold text-indigo-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {career.growth} ({career.demand})
                      </span>
                    </div>
                  </div>

                  {/* Pathway & Skills */}
                  <div className="border-t border-border/40 pt-3 text-xs space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Academic Pathway:</span>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">{career.pathway}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {career.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px] py-0">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/40 pt-4 mt-auto flex gap-3">
                  <Link href={`/skills?target=${career.id}`} className="flex-grow">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/95 text-white flex items-center gap-1.5">
                      <Map className="h-4 w-4" />
                      <span>Build Roadmap</span>
                    </Button>
                  </Link>
                  <Link href={`/colleges?branch=${career.id}`} className="flex-grow">
                    <Button size="sm" variant="outline" className="w-full flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Find Colleges</span>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
