import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            {/* Header Skeleton */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Method Skeleton */}
              <div className="lg:col-span-2">
                <GradientBorder>
                  <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                    <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                      <div className="mb-4">
                        <Skeleton className="h-7 w-48" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-2 space-y-3">
                      {/* Payment Option 1 */}
                      <div className="p-4 border-2 rounded-lg border-border bg-muted/30">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                      </div>

                      {/* Payment Option 2 */}
                      <div className="p-4 border-2 rounded-lg border-border bg-muted/30">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-9 w-9 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-44" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                      </div>
                    </CardContent>
                  </FloatingCard>
                </GradientBorder>
              </div>

              {/* Right Column - Booking Summary Skeleton */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <GradientBorder>
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                        <div className="mb-4">
                          <Skeleton className="h-7 w-40" />
                        </div>
                        {/* Booking ID Skeleton */}
                        <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                          <Skeleton className="h-3 w-24 mb-2" />
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-5 w-20 absolute top-3 right-3 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 md:px-8 pb-6 md:pb-8 pt-0 space-y-4">
                        {/* Booking Details Grid Skeleton */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        </div>

                        {/* Room & Customer Info Skeleton */}
                        <div className="space-y-2">
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <div className="flex-1 space-y-1">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-lg" />
                              <div className="flex-1 space-y-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-40" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Separator */}
                        <div className="my-4">
                          <Skeleton className="h-px w-full" />
                        </div>

                        {/* Payment Summary Skeleton */}
                        <div>
                          <Skeleton className="h-6 w-32 mb-3" />
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="my-2">
                              <Skeleton className="h-px w-full" />
                            </div>
                            <div className="flex justify-between items-center pt-2">
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-6 w-28" />
                            </div>
                          </div>
                        </div>

                        {/* Security Notice Skeleton */}
                        <div className="p-4 bg-muted/30 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-5 w-5 rounded mt-0.5" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        </div>

                        {/* Payment Button Skeleton */}
                        <Skeleton className="h-11 w-full rounded-lg" />
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


