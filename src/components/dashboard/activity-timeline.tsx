'use client';

import { useEffect, useState } from 'react';
import { Activity, Compass, Award, GraduationCap, CheckCircle } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';

export default function ActivityTimeline() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const defaultActivities = [
      {
        icon: Compass,
        title: 'Explored Career Recommendations',
        time: 'Just now',
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      },
      {
        icon: GraduationCap,
        title: 'Predicted college cutoffs using JEE Mains',
        time: '5 minutes ago',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      },
      {
        icon: Award,
        title: 'Discovered Pragati Scholarship eligibility',
        time: '1 hour ago',
        color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
      },
      {
        icon: CheckCircle,
        title: 'Completed student profile onboarding',
        time: '2 hours ago',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      },
    ];

    const fetchActivities = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/users/activities`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const timeAgo = (dateStr: string) => {
              const diffMs = new Date().getTime() - new Date(dateStr).getTime();
              const diffMins = Math.floor(diffMs / 60000);
              if (diffMins < 1) return 'Just now';
              if (diffMins < 60) return `${diffMins}m ago`;
              const diffHrs = Math.floor(diffMins / 60);
              if (diffHrs < 24) return `${diffHrs}h ago`;
              return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            };

            const mapped = data.map((act: any) => {
              let icon = Compass;
              let color = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
              const type = act.action_type;

              if (type.includes('profile')) {
                icon = CheckCircle;
                color = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
              } else if (type.includes('college')) {
                icon = GraduationCap;
                color = 'text-purple-500 bg-purple-500/10 border-purple-500/20';
              } else if (type.includes('scholarship') || type.includes('resume') || type.includes('skills')) {
                icon = Award;
                color = 'text-pink-500 bg-pink-500/10 border-pink-500/20';
              }

              return {
                icon,
                title: act.description,
                time: timeAgo(act.created_at),
                color
              };
            });
            setActivities(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend activities failed. Using mock defaults.", err);
      }
      setActivities(defaultActivities);
      setLoading(false);
    };

    fetchActivities();
  }, []);

  return (
    <div className="border border-border/80 bg-card rounded-xl p-5 md:p-6 flex flex-col gap-4 shadow-sm h-full">
      <div className="flex items-center gap-2 border-b border-border pb-3.5">
        <Activity className="h-4.5 w-4.5 text-primary" />
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Recent Activity</h3>
      </div>

      <div className="relative pl-6 border-l border-border/60 flex flex-col gap-6 mt-2 ml-3">
        {activities.map((act, idx) => {
          const Icon = act.icon;
          return (
            <div key={idx} className="relative">
              {/* Dot Icon Indicator */}
              <div className={`absolute -left-[38px] top-0 h-8 w-8 rounded-full border flex items-center justify-center bg-card shadow-sm ${act.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-xs font-semibold text-foreground leading-tight">
                  {act.title}
                </h4>
                <span className="text-[10px] text-muted-foreground">{act.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
