import { Skeleton } from "@/components/ui/skeleton";

export function RoomCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-card h-full">
      <div className="grid md:grid-cols-[200px_1fr] gap-4 p-4">
        {/* Image skeleton */}
        <div className="relative h-40 md:h-full rounded-lg overflow-hidden flex-shrink-0">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Room Info skeleton */}
        <div className="flex flex-col min-w-0">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="flex-1 min-w-0">
                {/* Room name skeleton */}
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-5 w-40" />
                </div>
                {/* Price skeleton */}
                <div className="mb-2">
                  <Skeleton className="h-6 w-32 mb-1" />
                </div>
              </div>
              {/* Badge skeleton */}
              <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
            </div>

            {/* Description skeleton */}
            <div className="mb-3">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Room details skeleton */}
            <div className="flex gap-3 mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Amenities skeleton */}
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-7 w-10 rounded" />
              <Skeleton className="h-7 w-10 rounded" />
              <Skeleton className="h-7 w-10 rounded" />
              <Skeleton className="h-7 w-10 rounded" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="pt-3 border-t mt-auto">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoomGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <RoomCardSkeleton key={index} />
      ))}
    </div>
  );
}

