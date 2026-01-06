import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";

export function RoomDetailSkeleton() {
  return (
    <>
      {/* Image Gallery Skeleton */}
      <section className="relative bg-gradient-subtle py-4 md:py-6">
        <div className="container-luxury">
          <div className="relative">
            {/* Back button skeleton */}
            <Skeleton className="absolute top-4 left-4 z-10 h-9 w-24 rounded-md" />
            
            {/* Main image skeleton */}
            <Skeleton className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl" />
            
            {/* Thumbnail skeleton */}
            <div className="mt-3 md:mt-4 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg" />
              ))}
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
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-8 w-32 ml-auto" />
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

