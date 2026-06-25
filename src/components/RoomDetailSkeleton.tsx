import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, CardHeader } from "@/components/ui/card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";

export function RoomDetailSkeleton() {
  return (
    <>
      {/* Image Gallery Skeleton */}
      <section className="relative bg-gradient-subtle py-4 md:py-6">
        <div className="container-luxury">
          <div className="relative">
            <Skeleton className="absolute top-4 left-4 z-10 h-9 w-24 rounded-md" />

            {/* Mobile: single hero image */}
            <Skeleton className="md:hidden w-full h-[280px] sm:h-[360px] rounded-xl" />

            {/* Desktop: Airbnb-style grid */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[420px] lg:h-[520px] rounded-xl overflow-hidden">
              <Skeleton className="col-span-2 row-span-2 rounded-none" />
              <Skeleton className="rounded-none" />
              <Skeleton className="rounded-none" />
              <Skeleton className="rounded-none" />
              <Skeleton className="rounded-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Room Details Skeleton */}
      <section className="py-8 md:py-12 bg-gradient-subtle">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Room Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <Skeleton className="h-8 md:h-10 w-56 md:w-72" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-9 md:h-10 w-36" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>

              {/* Room Information Card */}
              <GradientBorder containerClassName="relative">
                <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                  <CardContent className="p-6 md:p-8">
                    <Skeleton className="h-7 w-1/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-6" />

                    <div className="pt-4 border-t">
                      <Skeleton className="h-7 w-1/3 mb-4" />
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-4 w-full" />
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Skeleton className="h-7 w-1/3 mb-4" />
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-20 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <GradientBorder containerClassName="relative">
                <FloatingCard className="bg-card rounded-xl border border-border shadow-card sticky top-24">
                  <CardHeader className="p-6 md:p-8">
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-0 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                    <Skeleton className="h-12 w-full mt-4 rounded-md" />
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
