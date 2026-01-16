import { BellRing, Sparkles } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="mt-36 flex items-center justify-center">
      <div className="relative w-full max-w-sm rounded-2xl border p-6 backdrop-blur-xl">
        {/* Glow */}
        <div className="to-white-400/40 absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-blue-400/40 opacity-70 blur-lg" />

        <div className="relative space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <h2 className="text-xl font-semibold">This feature is cooking 🍳</h2>

          <p className="text-sm opacity-80">
            Something exciting is on the way. We’re crafting a smooth and
            delightful experience just for you.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <BellRing className="h-4 w-4" />
            Stay in touch with <span className="font-semibold">Hues</span>
          </div>

          <p className="text-xs opacity-70">
            Till then, feel free to explore our other exciting features.
          </p>
        </div>
      </div>
    </div>
  );
}
