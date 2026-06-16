import Link from 'next/link';
import { Github, Twitter, Linkedin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group text-white">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-sans text-lg font-bold tracking-tight">
                PathFinder <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Your AI Career GPS. Helping Indian students navigate careers, colleges, scholarships, and skill roadmaps.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Col */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Product</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">College Predictor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Scholarship Finder</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Skill Roadmap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Resume Analyzer</a></li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Resources</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Indian Exams Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Legal</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Settings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 PathFinder AI. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <span className="text-rose-500">&hearts;</span> for Indian students
          </span>
        </div>
      </div>
    </footer>
  );
}
