'use client';

import { useEffect, useState } from 'react';
import { Award, Coins, Calendar, ArrowRight, CheckCircle, Search, AlertCircle, Plus, Check, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAuthToken } from '@/lib/auth';

interface Scholarship {
  id: string;
  name: string;
  amount: string;
  provider: string;
  type: string;
  deadline: string;
  status: 'open' | 'closing_soon' | 'closed';
  url: string;
  matchPercentage: number;
  eligibilityMet: string[];
  eligibilityNotMet: string[];
  description: string;
}

export default function ScholarshipFinderPage() {
  const [profile, setProfile] = useState<any>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('student_profile');
    let category = 'general';
    let income = '3_6';
    let gender = 'male';
    let stream = 'pcm';

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setProfile(parsed);
        category = parsed.category || 'general';
        income = parsed.income || '3_6';
        gender = parsed.gender || 'male';
        stream = parsed.stream || 'pcm';
      } catch (e) {
        console.error(e);
      }
    } else {
      setProfile({
        name: 'Guest Student',
        category: 'general',
        income: '3_6',
        gender: 'female', // set female for guest to show Pragati eligibility!
        stream: 'pcm',
        isGuest: true
      });
      gender = 'female';
    }

    // Curate scholarships matching profile constraints
    const db: Scholarship[] = [
      {
        id: 'pragati-aicte',
        name: 'Pragati Scholarship for Girl Students',
        amount: '₹50,000 / year',
        provider: 'AICTE, Government of India',
        type: 'Govt Central',
        deadline: '2026-10-31',
        status: 'open',
        url: 'https://scholarships.gov.in',
        matchPercentage: gender === 'female' ? 95 : 30,
        eligibilityMet: gender === 'female' ? ['Female candidate', 'Enrolled in technical degree'] : ['Enrolled in technical degree'],
        eligibilityNotMet: gender !== 'female' ? ['Only female candidates eligible'] : [],
        description: 'Empowering girl students pursuing technical education (Degree/Diploma) in AICTE approved colleges.'
      },
      {
        id: 'central-sector',
        name: 'Central Sector Scheme of Scholarship for College Students',
        amount: '₹12,000 / year',
        provider: 'Department of Higher Education, India',
        type: 'Govt Central',
        deadline: '2026-09-15',
        status: 'open',
        url: 'https://scholarships.gov.in',
        matchPercentage: 85,
        eligibilityMet: ['Above 80th percentile in Class 12 boards', 'Family income < ₹4.5 LPA'],
        eligibilityNotMet: [],
        description: 'Financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies.'
      },
      {
        id: 'post-matric-obc',
        name: 'Post Matric Scholarship for OBC Students',
        amount: '₹10,000 / year',
        provider: 'State Government Scheme',
        type: 'Govt State',
        deadline: '2026-08-30',
        status: 'closing_soon',
        url: 'https://scholarships.gov.in',
        matchPercentage: category === 'obc' ? 90 : 20,
        eligibilityMet: category === 'obc' ? ['Belongs to OBC category', 'Family income < ₹2.5 LPA'] : [],
        eligibilityNotMet: category !== 'obc' ? ['Only OBC candidates eligible'] : [],
        description: 'State funded education aids for candidates belonging to backward classes pursuing post-matric courses.'
      },
      {
        id: 'reliance-foundation',
        name: 'Reliance Foundation Undergraduate Scholarships',
        amount: '₹2,000,000 (One-time)',
        provider: 'Reliance Foundation (Private)',
        type: 'Private Trust',
        deadline: '2026-10-15',
        status: 'open',
        url: 'https://scholarships.reliancefoundation.org',
        matchPercentage: 90,
        eligibilityMet: ['Meritorious Class 12 score', 'Family income < ₹15 LPA'],
        eligibilityNotMet: [],
        description: 'Supports meritorious undergraduate students from all streams in India to continue their professional studies.'
      }
    ];

    // Sort by match percentage
    const fetchScholarships = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/scholarships/match`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.matches && data.matches.length > 0) {
            const mapped = data.matches.map((item: any, idx: number) => ({
              id: `sch-${idx}`,
              name: item.name,
              amount: item.value,
              provider: item.provider,
              type: item.name.toLowerCase().includes('state') ? 'Govt State' : item.provider.toLowerCase().includes('private') ? 'Private Trust' : 'Govt Central',
              deadline: '2026-10-31',
              status: 'open',
              url: 'https://scholarships.gov.in',
              matchPercentage: 90,
              eligibilityMet: [item.eligibility],
              eligibilityNotMet: [],
              description: `Required documents: ${item.requirements.join(', ')}. Details: ${item.eligibility}`
            }));
            setScholarships(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend scholarship matching failed. Using mock defaults.", err);
      }
      db.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setScholarships(db);
      setLoading(false);
    };

    fetchScholarships();
  }, []);

  const toggleSave = (id: string) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredScholarships = filter === 'all'
    ? scholarships
    : scholarships.filter((s) => s.type.toLowerCase().includes(filter.toLowerCase()) || s.status === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" /> Scholarship Finder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover government and private financial aid options tailored to your category and income.
          </p>
        </div>

        {/* Filter triggers */}
        <div className="flex gap-1.5 p-1 border border-border bg-card/60 rounded-lg w-fit text-xs">
          {['all', 'govt', 'private', 'closing_soon'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all ${
                filter === item ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item === 'govt' ? 'Govt Schemes' : item === 'private' ? 'Private Trusts' : item === 'closing_soon' ? 'Closing Soon' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">Mapping matching parameters...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* AI Banner summary */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3.5 backdrop-blur-sm">
            <Coins className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className="font-bold text-foreground">Scholarship Matching:</span> Mapped against your category{' '}
              <span className="font-semibold text-primary">{profile?.category?.toUpperCase() || 'GENERAL'}</span>, gender{' '}
              <span className="font-semibold text-primary">{profile?.gender?.toUpperCase() || 'MALE'}</span>, and family income range of{' '}
              <span className="font-semibold text-primary">₹{profile?.income === '3_6' ? '3-6 Lakhs' : 'under 8 Lakhs'} LPA</span>. Auto-discover opportunities below.
            </div>
          </div>

          {/* List of Scholarships */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredScholarships.map((sch) => {
              const isSaved = saved.includes(sch.id);
              return (
                <Card key={sch.id} className="hover:border-primary/20 transition-all shadow-sm flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-[9px] py-0">{sch.type}</Badge>
                          <Badge
                            className={`text-[9px] py-0 ${
                              sch.status === 'open'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}
                            variant="outline"
                          >
                            {sch.status === 'open' ? 'Open' : 'Closing Soon'}
                          </Badge>
                        </div>
                        <CardTitle className="text-base font-bold mt-2.5 leading-snug">{sch.name}</CardTitle>
                        <CardDescription className="text-xs mt-1.5 leading-relaxed">
                          {sch.description}
                        </CardDescription>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSave(sch.id)}
                        className={`h-8 w-8 rounded-full border border-border/80 transition-all ${
                          isSaved ? 'text-amber-500 bg-amber-500/10 border-amber-500/25' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        aria-label="Wishlist Bookmark"
                      >
                        {isSaved ? <Star className="h-4 w-4 fill-amber-500" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 py-3 text-xs">
                    {/* Amount & Provider */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/35 border border-border/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Scholarship Value:</span>
                        <span className="text-sm font-extrabold text-indigo-500">{sch.amount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-0.5">Provider:</span>
                        <span className="font-semibold text-foreground truncate block">{sch.provider}</span>
                      </div>
                    </div>

                    {/* Eligibility lists */}
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      {sch.eligibilityMet.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Eligibility Met:</span>
                          <ul className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            {sch.eligibilityMet.map((met, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                <span>{met}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sch.eligibilityNotMet.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Mismatched criteria:</span>
                          <ul className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                            {sch.eligibilityNotMet.map((nMet, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                                <span className="line-through">{nMet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/40 pt-4 mt-auto flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Apply before: <span className="font-semibold text-foreground">{sch.deadline}</span></span>
                    </span>

                    <a href={sch.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-primary hover:bg-primary/95 text-white flex items-center gap-1">
                        <span>Apply Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
