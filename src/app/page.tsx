import { RepoSelector } from "@/components/repo/repo-selector";
import { ModePromo } from "@/components/shared/mode-promo";
import { SiteFooter } from "@/components/shared/site-footer";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto page-rails">
      <Suspense>
        <RepoSelector />
        <ModePromo />
      </Suspense>
      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
