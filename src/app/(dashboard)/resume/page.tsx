'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Suggestions {
  type: 'critical' | 'important' | 'nice_to_have';
  message: string;
}

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis Results
  const [score, setScore] = useState(72);
  const [sectionScores, setSectionScores] = useState({
    content: 80,
    formatting: 75,
    keywords: 62,
    impact: 70,
  });
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [presentKeywords, setPresentKeywords] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestions[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Dynamically load third-party CDN scripts
  const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.id = id;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load parser tool: ${src}`));
      document.head.appendChild(script);
    });
  };

  const loadPdfJs = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'pdfjs-lib');
    const pdfjsLib = (window as any).pdfjsLib;
    if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    return pdfjsLib;
  };

  const loadMammoth = async () => {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth-lib');
    return (window as any).mammoth;
  };

  // Parse Text based on file type
  const extractText = async (targetFile: File): Promise<string> => {
    const extension = targetFile.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await targetFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n';
      }
      return text;
    } else if (extension === 'docx') {
      const mammoth = await loadMammoth();
      const arrayBuffer = await targetFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
    }
  };

  // Rule-based resume evaluator
  const analyzeResumeText = (text: string, role: string) => {
    const textLower = text.toLowerCase();
    let coreKeywords: string[] = [];
    let extraKeywords: string[] = [];
    let roleDisplay = '';

    if (role === 'Software Engineer') {
      coreKeywords = ['html', 'css', 'javascript', 'react', 'typescript', 'next.js', 'git', 'node.js'];
      extraKeywords = ['redux', 'zustand', 'jest', 'tailwind', 'aws', 'docker', 'graphql', 'mongodb', 'sql', 'express'];
      roleDisplay = 'Software Engineer';
    } else if (role === 'Machine Learning Engineer') {
      coreKeywords = ['python', 'pytorch', 'tensorflow', 'scikit-learn', 'machine learning', 'deep learning', 'numpy', 'pandas', 'git'];
      extraKeywords = ['nlp', 'llm', 'keras', 'docker', 'aws', 'sql', 'statistics', 'opencv', 'transformers'];
      roleDisplay = 'Machine Learning Engineer';
    } else if (role === 'Data Scientist') {
      coreKeywords = ['python', 'sql', 'pandas', 'excel', 'tableau', 'power bi', 'statistics', 'probability', 'git'];
      extraKeywords = ['r', 'matplotlib', 'seaborn', 'regression', 'clustering', 'scikit-learn', 'jupyter', 'bigquery'];
      roleDisplay = 'Data Scientist / Analyst';
    } else if (role === 'Product Manager') {
      coreKeywords = ['product management', 'agile', 'scrum', 'jira', 'roadmap', 'analytics', 'sql', 'wireframe', 'ab testing'];
      extraKeywords = ['figma', 'amplitude', 'mixpanel', 'user research', 'customer feedback', 'kpis', 'metrics', 'strategy'];
      roleDisplay = 'Product Manager';
    }

    const allKeywords = [...coreKeywords, ...extraKeywords];
    const matched: string[] = [];
    const missing: string[] = [];

    const cleanRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    allKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${cleanRegExp(kw)}\\b`, 'i');
      if (regex.test(textLower)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const capitalize = (s: string) => {
      if (s === 'html') return 'HTML';
      if (s === 'css') return 'CSS';
      if (s === 'sql') return 'SQL';
      if (s === 'nlp') return 'NLP';
      if (s === 'llm') return 'LLMs';
      if (s === 'kpis') return 'KPIs';
      return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const presentKeywordsDisplay = matched.map(capitalize);
    const missingKeywordsDisplay = missing.map(capitalize);

    const coreMatched = coreKeywords.filter(kw => matched.includes(kw));
    const coreRatio = coreKeywords.length > 0 ? coreMatched.length / coreKeywords.length : 0;
    const overallRatio = allKeywords.length > 0 ? matched.length / allKeywords.length : 0;
    const keywordScoreValue = Math.round((coreRatio * 0.7 + overallRatio * 0.3) * 100);

    const actionVerbs = [
      'designed', 'developed', 'optimized', 'implemented', 'built', 'led', 'managed',
      'created', 'coordinated', 'executed', 'analyzed', 'researched', 'programmed', 'integrated'
    ];
    let uniqueVerbsFound = 0;
    actionVerbs.forEach(verb => {
      if (textLower.includes(verb)) {
        uniqueVerbsFound++;
      }
    });
    const contentScoreValue = Math.min(100, 50 + (uniqueVerbsFound * 5));

    const metricRegex = /\b\d+(?:%|x|k|LPA|lakh|crore|L)\b|\b(growth|revenue|conversion|speed|performance|users|improved|reduced|saved)\s+by\s+\d+/gi;
    const metricMatches = textLower.match(metricRegex) || [];
    const metricCount = metricMatches.length;
    let impactScoreValue = 55;
    if (metricCount >= 3) {
      impactScoreValue = Math.min(100, 85 + (metricCount * 2));
    } else if (metricCount > 0) {
      impactScoreValue = 70 + (metricCount * 5);
    }

    const headers = ['experience', 'education', 'projects', 'skills', 'contact', 'summary', 'achievements', 'certifications'];
    let headersFound = 0;
    headers.forEach(h => {
      if (textLower.includes(h)) {
        headersFound++;
      }
    });
    const formatScoreValue = Math.min(100, 60 + (headersFound * 5));

    const overallScoreValue = Math.round(
      (contentScoreValue + formatScoreValue + keywordScoreValue + impactScoreValue) / 4
    );

    const computedSuggestions: Suggestions[] = [];

    if (impactScoreValue < 75) {
      computedSuggestions.push({
        type: 'critical',
        message: 'Quantify Achievements: Your impact score is low. Add measurable statistics (e.g. "improved speed by 30%", "managed 5 developers", or "saved ₹50K annually") to validate your projects.'
      });
    }

    if (coreMatched.length < coreKeywords.length / 2) {
      const topMissing = missingKeywordsDisplay.slice(0, 2).join(' and ');
      computedSuggestions.push({
        type: 'critical',
        message: `Add Core Competencies: Missing essential tools for ${roleDisplay}. Incorporate keywords like ${topMissing || 'essential libraries'} to pass automated candidate screening.`
      });
    }

    if (formatScoreValue < 80) {
      computedSuggestions.push({
        type: 'critical',
        message: 'Standardize Headers: Use simple section names (e.g., "Experience", "Education", "Projects", "Skills"). Avoid custom wording like "Where I have worked" which confuses parser scanners.'
      });
    }

    if (role === 'Software Engineer') {
      computedSuggestions.push({
        type: 'important',
        message: 'State Management & Testing: Specify testing frameworks (e.g. Jest, Cypress) or state hooks/libraries (e.g. Redux, Zustand) to demonstrate enterprise readiness.'
      });
    } else if (role === 'Machine Learning Engineer') {
      computedSuggestions.push({
        type: 'important',
        message: 'Platform Experience: Detail GPU computation scaling tools (PyTorch, TensorFlow) and cloud model orchestration services (AWS, Docker, Kubernetes).'
      });
    } else if (role === 'Data Scientist') {
      computedSuggestions.push({
        type: 'important',
        message: 'Analytics Dashboards: Explicitly name visualization engines like Tableau or Power BI and data warehouse engines (SQL, BigQuery).'
      });
    } else if (role === 'Product Manager') {
      computedSuggestions.push({
        type: 'important',
        message: 'Agile & Collaboration: Describe experience outlining product roadmaps, detailing specs (PRDs), tracking sprints in Jira/Scrum, and executing A/B testing.'
      });
    }

    computedSuggestions.push({
      type: 'nice_to_have',
      message: 'Include Profiles: Ensure clickable links to professional domains (e.g., LinkedIn, GitHub, BeHance) are added in the contact header.'
    });

    computedSuggestions.push({
      type: 'nice_to_have',
      message: 'Layout Columns: Keep a clean single-column text format. Multi-column templates or tables often merge parallel lines into unreadable sentences in older ATS machines.'
    });

    return {
      score: overallScoreValue,
      sectionScores: {
        content: contentScoreValue,
        formatting: formatScoreValue,
        keywords: keywordScoreValue,
        impact: impactScoreValue
      },
      presentKeywords: presentKeywordsDisplay,
      missingKeywords: missingKeywordsDisplay,
      suggestions: computedSuggestions
    };
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const extractedText = await extractText(file);
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not parse readable text from the document. Please ensure the file is not empty or scanned/secured.');
      }

      const results = analyzeResumeText(extractedText, targetRole);

      setScore(results.score);
      setSectionScores(results.sectionScores);
      setPresentKeywords(results.presentKeywords);
      setMissingKeywords(results.missingKeywords);
      setSuggestions(results.suggestions);
      setAnalyzed(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to analyze the resume. Please try another file.');
      setAnalyzed(false);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" /> Resume Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Check your resume ATS compatibility score and uncover missing keyword gaps for your target job roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Upload */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Upload Resume</CardTitle>
              <CardDescription className="text-xs">Support formats: PDF, DOCX (Max size: 5MB).</CardDescription>
            </CardHeader>
            <form onSubmit={handleAnalyze}>
              <CardContent className="space-y-4">
                {/* Drag Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
                    dragging
                      ? 'border-primary bg-primary/5'
                      : file
                      ? 'border-emerald-500/50 bg-emerald-500/[0.02]'
                      : 'border-border bg-secondary/15 hover:bg-secondary/25'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden"
                    ref={fileInputRef}
                    id="resume-file-input"
                  />
                   <div className="flex flex-col items-center gap-2.5">
                    {file ? (
                      <>
                        <CheckCircle2 className="h-9 w-9 text-emerald-500 animate-bounce" />
                        <span className="text-xs font-semibold text-emerald-600 truncate max-w-[180px]">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Click to change
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-9 w-9 text-muted-foreground" />
                        <span className="text-xs font-semibold">Drag & drop files here</span>
                        <span className="text-[10px] text-muted-foreground">or click to browse local files</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Target Role</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="Software Engineer">Software Engineer (Frontend/Backend)</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Data Scientist">Data Analyst / Scientist</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={!file || analyzing}
                  className="w-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-1.5 h-11"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Parsing Text...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Resume</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Columns: Analysis result output */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!analyzed ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl bg-card/40">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-sm">Awaiting Analysis</h3>
              <p className="text-xs text-muted-foreground mt-1">Upload your PDF resume and click &quot;Analyze Resume&quot; to review scores.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score breakdown metrics card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-border bg-card p-5 md:p-6 rounded-xl shadow-sm">
                {/* Score Ring */}
                <div className="flex flex-col items-center justify-center text-center p-3 border-r border-border/60">
                  <div className="relative h-28 w-28 flex items-center justify-center rounded-full border-4 border-secondary">
                    {/* Inner score */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-indigo-500">{score}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">Overall</span>
                    </div>
                  </div>
                  <Badge className="mt-3.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20" variant="outline">
                    ATS Compatible
                  </Badge>
                </div>

                {/* Score bar chart lists */}
                <div className="md:col-span-2 space-y-3 p-2 text-xs">
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Score Breakdown</h4>
                  <div className="space-y-2.5">
                    {Object.entries(sectionScores).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="capitalize font-semibold">{key}</span>
                          <span className="font-bold">{val} / 100</span>
                        </div>
                        <Progress value={val} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions List */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-primary" /> Prioritized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 text-xs">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start gap-2.5 leading-normal ${
                        sug.type === 'critical'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : sug.type === 'important'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                      }`}
                    >
                      <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold uppercase text-[9px] tracking-wider block mb-0.5">
                          {sug.type.replace('_', ' ')}
                        </span>
                        <span className="font-medium text-foreground">{sug.message}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Keywords analyzer card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing keywords */}
                <Card className="shadow-sm border-rose-500/15">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500">Missing Keywords</CardTitle>
                    <CardDescription className="text-[11px]">Add these to improve your ATS search matching rate.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5 pt-0">
                    {missingKeywords.map((kw) => (
                      <Badge key={kw} className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/10" variant="outline">
                        + {kw}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>

                {/* Present keywords */}
                <Card className="shadow-sm border-emerald-500/15">
                  <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Present Keywords</CardTitle>
                    <CardDescription className="text-[11px]">Well optimized keywords parsed successfully.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5 pt-0">
                    {presentKeywords.map((kw) => (
                      <Badge key={kw} className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10" variant="outline">
                        &bull; {kw}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
