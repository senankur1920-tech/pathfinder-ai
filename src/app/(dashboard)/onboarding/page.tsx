import OnboardingWizard from '@/components/onboarding/wizard';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 bg-slate-950 gradient-mesh">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <OnboardingWizard />
      </div>
    </div>
  );
}
