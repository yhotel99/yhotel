import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";

export function PaymentSkeleton() {
  return (
    <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gradient-section">
      <div className="container-luxury">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
              <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
            </div>
            <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 mx-auto mb-4" />
            <Skeleton className="h-4 sm:h-5 w-64 sm:w-80 mx-auto" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            <GradientBorder>
              <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                <CardHeader className="p-4 sm:p-6 md:p-8 pb-0 space-y-0">
                  <div className="mb-4 md:mb-1">
                    <Skeleton className="h-6 sm:h-7 w-32 sm:w-40" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8 pt-2 md:pt-1 space-y-4 sm:space-y-6">
                  {/* QR + Bank Info */}
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    {/* QR Code box */}
                    <div className="flex items-center justify-center p-4 sm:p-6 bg-background/60 rounded-xl border border-border/60 w-full max-w-[360px] h-[min(280px,calc(100vw-2rem))] sm:h-[320px] md:h-[360px] mx-auto md:mx-0">
                      <Skeleton className="w-full h-full max-w-[260px] max-h-[260px] rounded-lg" />
                    </div>

                    {/* Bank Account Info */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-3">
                        <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <Skeleton className="h-4 w-28 mb-2" />
                          <Skeleton className="h-6 w-48" />
                        </div>

                        <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-5 w-40" />
                        </div>

                        <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-5 w-56" />
                        </div>

                        <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-6 w-48 mb-3" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Amount */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-7 w-40 mb-1" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-24 mb-2 ml-auto" />
                        <Skeleton className="h-6 w-32 ml-auto" />
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                    <Skeleton className="h-3 w-64" />
                  </div>
                </CardContent>
              </FloatingCard>
            </GradientBorder>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <GradientBorder>
                <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                  <CardHeader className="p-4 sm:p-6 md:p-8 pb-0 space-y-0">
                    <div className="mb-4">
                      <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                    </div>
                    <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4 md:mb-0">
                      <div className="absolute top-3 right-3">
                        <Skeleton className="h-6 w-20 sm:w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 pt-4 md:pt-0 space-y-4">
                    {/* Booking details grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-3 border rounded-lg bg-muted/30 space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Customer info */}
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-40" />
                      <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="flex-1 space-y-1">
                              <Skeleton className="h-3 w-20" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Payment summary */}
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-3 w-40" />
                        <Separator />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-6 w-32" />
                        </div>
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>

                    {/* Timer / status */}
                    <div className="w-full p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex flex-col items-center space-y-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                    </div>
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

