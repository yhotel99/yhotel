import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";

export function RoomCardSkeleton() {
  return (
    <GradientBorder containerClassName="relative h-full">
      <FloatingCard className="overflow-hidden h-full bg-card rounded-xl border border-border shadow-card">
        {/* Image skeleton */}
        <div className="relative overflow-hidden rounded-t-xl">
          <Skeleton className="w-full h-32 md:h-48 lg:h-52" />
          {/* Badges skeleton */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full bg-background/90" />
            <Skeleton className="h-5 w-20 rounded-full bg-background/90" />
          </div>
          {/* Quick info skeleton */}
          <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-6 w-24 rounded-md bg-black/40" />
          </div>
        </div>

        <CardContent className="p-2 md:p-3 flex flex-col flex-1">
          {/* Room name skeleton */}
          <Skeleton className="h-5 w-3/4 mb-2" />
          
          {/* Price skeleton */}
          <Skeleton className="h-6 w-32 mb-2" />
          
          {/* Features skeleton */}
          <div className="mb-2 hidden md:block">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Button skeleton */}
          <Skeleton className="h-9 w-full mt-auto rounded-md" />
        </CardContent>
      </FloatingCard>
    </GradientBorder>
  );
}

export function RoomGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <RoomCardSkeleton key={index} />
      ))}
    </div>
  );
}

