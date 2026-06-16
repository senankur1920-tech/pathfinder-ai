import GreetingHeader from '@/components/dashboard/greeting-header';
import QuickActions from '@/components/dashboard/quick-actions';
import CareerSummary from '@/components/dashboard/career-summary';
import ProfileCompleteness from '@/components/dashboard/profile-completeness';
import ActivityTimeline from '@/components/dashboard/activity-timeline';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Welcoming Banner */}
      <GreetingHeader />

      {/* 2. Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Actions & Match Metrics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Navigation</h3>
            <QuickActions />
          </div>
          <div className="mt-2">
            <CareerSummary />
          </div>
        </div>

        {/* Right 1 Col: Status & Feeds */}
        <div className="flex flex-col gap-6">
          <ProfileCompleteness />
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
