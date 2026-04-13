"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi, enUS, zhCN } from "date-fns/locale";
import { 
  Calendar, 
  Users, 
  Building2,
  Clock,
  User,
  Banknote,
  Copy,
  Loader2,
  Phone,
  Mail,
  FileText,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { RoomDetailSkeleton } from "@/components/RoomDetailSkeleton";
import { PaymentSkeleton } from "@/components/PaymentSkeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { BOOKING_STATUS, bookingStatusLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import { BANK_BIN_CODES } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const PaymentContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const bookingId = searchParams.get("booking_id");
  const channelRef = useRef<RealtimeChannel | null>(null);
  const previousStatusRef = useRef<string | null>(null);
  const hasRedirectedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, setSubscriptionKey] = useState(0); // Force re-subscription on retry
  const { t, language } = useLanguage();

  // Date locale based on language
  const dateLocale = language === "vi" ? vi : language === "zh" ? zhCN : enUS;

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Payment] Fetching booking data for:', bookingId);
      }
      if (!bookingId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Payment] No bookingId provided');
        }
        return null;
      }
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('[Payment] API response:', {
          status: response.status,
          ok: response.ok,
          bookingId,
        });
      }
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[Payment] API error:', response.status, response.statusText);
        }
        throw new Error(t.payment.notFound);
      }
      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('[Payment] Booking data fetched:', {
          id: data.id,
          status: data.status,
          booking_code: data.booking_code,
        });
      }
      return data;
    },
    enabled: !!bookingId,
    refetchInterval: false, // Disable polling, use realtime instead
  });

  // Log when booking data changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Payment] Component state:', {
        bookingId,
        isLoading,
        hasError: !!error,
        hasBooking: !!booking,
        bookingStatus: booking?.status,
      });
    }
  }, [bookingId, isLoading, error, booking]);

  // Update previousStatusRef when booking changes from query (not from realtime)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Payment] Booking data changed:', {
        bookingId,
        status: booking?.status,
        previousStatus: previousStatusRef.current,
        hasBooking: !!booking,
      });
    }

    // Initialize previousStatusRef with current status
    if (booking?.status && previousStatusRef.current === null) {
      previousStatusRef.current = booking.status;
      if (process.env.NODE_ENV === 'development') {
        console.log('[Payment] Initial status set:', booking.status);
      }
    }

    // Only update if it's different to avoid unnecessary updates
    if (booking?.status && previousStatusRef.current !== booking.status) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Payment] Status updated from query:', {
          from: previousStatusRef.current,
          to: booking.status,
        });
      }
      previousStatusRef.current = booking.status;
    }
    
    // If booking is already confirmed when page loads, redirect to success page
    // Use hasRedirectedRef to prevent double redirect
    if (
      !hasRedirectedRef.current &&
      booking?.status === BOOKING_STATUS.CONFIRMED &&
      bookingId
    ) {
      hasRedirectedRef.current = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('[Payment] Booking already confirmed, redirecting to success page...');
      }
      // Small delay to ensure page is fully loaded
      const redirectTimer = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Payment] Executing redirect to success page');
        }
        router.push(`/checkout/success?booking_id=${bookingId}`);
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [booking, bookingId, router]);

  // Setup realtime subscription for booking status changes
  // subscriptionKey is used to force re-subscription on retry
  useEffect(() => {
    if (!bookingId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Realtime] Skipping subscription setup: no bookingId');
      }
      return;
    }

    // Initialize previousStatusRef if booking data is available
    if (booking?.status && previousStatusRef.current === null) {
      previousStatusRef.current = booking.status;
      if (process.env.NODE_ENV === 'development') {
        console.log('[Realtime] Initial status from booking:', booking.status);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Realtime] Setting up subscription for booking:', bookingId);
      console.log('[Realtime] Current booking status:', booking?.status);
      console.log('[Realtime] Previous status ref:', previousStatusRef.current);
    }

    // Create realtime channel for this specific booking
    const channelName = `booking-${bookingId}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Realtime] Creating channel:', channelName);
    }
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        async (payload) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Realtime] Received UPDATE event:', {
              event: payload.eventType,
              table: payload.table,
              schema: payload.schema,
              new: payload.new,
              old: payload.old,
            });
          }

          const updatedBookingData = payload.new;
          const oldStatus = previousStatusRef.current;
          const newStatus = updatedBookingData.status;

          if (process.env.NODE_ENV === 'development') {
            console.log('[Realtime] Status change detected:', {
              oldStatus,
              newStatus,
              bookingId,
            });
          }

          // Refetch full booking data from API to get all related data (room, customer, etc.)
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Realtime] Refetching booking data from API...');
            }
            const response = await fetch(`/api/bookings/${bookingId}`);
            if (process.env.NODE_ENV === 'development') {
              console.log('[Realtime] API response status:', response.status);
            }
            
            if (response.ok) {
              const fullBookingData = await response.json();
              if (process.env.NODE_ENV === 'development') {
                console.log('[Realtime] Full booking data received:', fullBookingData);
              }
              
              // Update React Query cache with full booking data
              queryClient.setQueryData(['booking', bookingId], fullBookingData);
              if (process.env.NODE_ENV === 'development') {
                console.log('[Realtime] React Query cache updated');
              }

              // Show toast notification if status changed
              // Check oldStatus !== null to ensure we have a valid previous status
              if (oldStatus !== null && oldStatus !== newStatus) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[Realtime] Status changed from', oldStatus, 'to', newStatus);
                }
                
                const oldStatusLabel = bookingStatusLabels[oldStatus as keyof typeof bookingStatusLabels] || oldStatus;
                const newStatusLabel = bookingStatusLabels[newStatus as keyof typeof bookingStatusLabels] || newStatus;
                
                toast({
                  title: t.payment.statusChanged,
                  description: t.payment.statusChangedFrom
                    .replace('{oldStatus}', oldStatusLabel)
                    .replace('{newStatus}', newStatusLabel),
                  duration: 5000,
                });

                // If booking is confirmed, show success message and redirect
                // Use hasRedirectedRef to prevent double redirect
                if (newStatus === BOOKING_STATUS.CONFIRMED && !hasRedirectedRef.current) {
                  hasRedirectedRef.current = true;
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[Realtime] Booking confirmed! Redirecting to success page...');
                  }
                  toast({
                    title: t.payment.paymentSuccess,
                    description: t.payment.paymentSuccessDescription,
                    duration: 3000,
                  });
                  
                  // Redirect to success page after a short delay
                  setTimeout(() => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[Realtime] Executing redirect to success page');
                    }
                    router.push(`/checkout/success?booking_id=${bookingId}`);
                  }, 1500);
                }

                // If booking is cancelled, show warning
                if (newStatus === BOOKING_STATUS.CANCELLED) {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[Realtime] Booking cancelled');
                  }
                  toast({
                    title: t.payment.bookingCancelled,
                    description: t.payment.bookingCancelledDescription,
                    variant: "destructive",
                    duration: 5000,
                  });
                }
              } else {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[Realtime] No status change detected (same status or no old status)');
                }
              }

              // Update previous status
              previousStatusRef.current = newStatus;
              if (process.env.NODE_ENV === 'development') {
                console.log('[Realtime] Previous status updated to:', newStatus);
              }
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.error('[Realtime] API response not OK:', response.status, response.statusText);
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('[Realtime] Error refetching booking after realtime update:', error);
            }
          }
        }
      )
      .subscribe((status, err) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Realtime] Subscription status changed:', {
            status,
            bookingId,
            channelName,
            error: err,
          });
        }
        
        if (status === 'SUBSCRIBED') {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Realtime] ✅ Successfully subscribed to booking:', bookingId);
          }
          // Reset retry count on successful subscription
          retryCountRef.current = 0;
        }
        
        if (status === 'CHANNEL_ERROR') {
          const errorMessage = err?.message || 'Unknown error';
          console.error('[Realtime] ❌ Channel error for booking:', bookingId, errorMessage);
          
          // Retry subscription if we haven't exceeded max retries
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current += 1;
            const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000); // Exponential backoff, max 5s
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Realtime] Retrying subscription (attempt ${retryCountRef.current}/${maxRetries}) in ${retryDelay}ms...`);
            }
            
            // Clear any existing retry timeout
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            
            // Retry after delay by recreating the subscription
            retryTimeoutRef.current = setTimeout(() => {
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
              // Force re-subscription by updating subscriptionKey
              setSubscriptionKey(prev => prev + 1);
            }, retryDelay);
          } else {
            // Max retries exceeded, show user-friendly message
            console.warn('[Realtime] ⚠️ Max retries exceeded. Realtime subscription failed. Falling back to polling.');
            toast({
              title: t.payment.realtimeUnavailable,
              description: t.payment.realtimeUnavailableDescription,
              variant: "default",
              duration: 5000,
            });
          }
        }
        
        if (status === 'TIMED_OUT') {
          console.warn('[Realtime] ⚠️ Subscription timed out for booking:', bookingId);
          
          // Retry on timeout
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current += 1;
            const retryDelay = 2000;
            
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            
            retryTimeoutRef.current = setTimeout(() => {
              if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
              }
            }, retryDelay);
          }
        }
        
        if (status === 'CLOSED') {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Realtime] 🔒 Channel closed for booking:', bookingId);
          }
        }
      });

    channelRef.current = channel;
    if (process.env.NODE_ENV === 'development') {
      console.log('[Realtime] Channel reference stored');
    }

    // Cleanup subscription on unmount
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Realtime] Cleaning up subscription for booking:', bookingId);
      }
      
      // Clear any pending retry timeouts
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        if (process.env.NODE_ENV === 'development') {
          console.log('[Realtime] Channel removed');
        }
        channelRef.current = null;
      }
      
      // Reset retry count on cleanup
      retryCountRef.current = 0;
    };
  }, [bookingId, booking?.status, queryClient, toast, router]);

  const canProceedPayment = booking?.status === BOOKING_STATUS.PENDING;

  const [isCopied, setIsCopied] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes
  const [isCancelling, setIsCancelling] = useState(false);
  const [isQrLoaded, setIsQrLoaded] = useState(false);

  // Handle timeout - cancel booking if not paid
  const handleTimeoutCancel = useCallback(async () => {
    if (!bookingId || isCancelling) return;
    
    // Check if booking is still pending
    if (booking?.status !== BOOKING_STATUS.PENDING) {
      // Booking already confirmed or cancelled, redirect to success
      router.push(`/checkout/success?booking_id=${bookingId}`);
      return;
    }

    setIsCancelling(true);
    
    try {
      // Cancel the booking using RPC function
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: BOOKING_STATUS.CANCELLED,
        }),
      });

      if (response.ok) {
        toast({
          title: t.payment.timeoutTitle,
          description: t.payment.timeoutDescription,
          variant: "destructive",
          duration: 5000,
        });
        
        // Redirect to success page with cancelled status
        setTimeout(() => {
          router.push(`/checkout/success?booking_id=${bookingId}&timeout=true`);
        }, 2000);
      } else {
        console.error('Failed to cancel booking:', await response.text());
        toast({
          title: t.payment.systemError,
          description: t.payment.cancelError,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: t.payment.systemError,
        description: t.payment.cancelErrorDescription,
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  }, [bookingId, isCancelling, booking?.status, router, toast]);

  // Countdown timer effect
  useEffect(() => {
    if (canProceedPayment && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Countdown finished, cancel booking if not paid
            handleTimeoutCancel();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [canProceedPayment, countdown, handleTimeoutCancel]);

  const bankAccount = {
    number: "01801807326",
    bank: "TP Bank",
    bankBin: BANK_BIN_CODES["TPBank"] || "970423", // TP Bank BIN code
    owner: "CÔNG TY CỔ PHẦN KHÁCH SẠN YQ"
  };

  // Use booking_code if available, otherwise fallback to booking ID
  // Use booking_code from database (format: YH20251230000001)
  // Fallback to booking ID if booking_code is not available
  const paymentContent = booking?.booking_code || (bookingId ? bookingId.slice(0, 8).toUpperCase() : "");

  const grossAmount = booking ? Number(booking.total_amount) || 0 : 0;
  const amountPayable = booking
    ? Number(
        booking.final_amount != null && booking.final_amount !== ""
          ? booking.final_amount
          : booking.total_amount
      ) || 0
    : 0;
  const voucherDiscount =
    booking &&
    booking.voucher_discount != null &&
    Number(booking.voucher_discount) > 0
      ? Number(booking.voucher_discount)
      : 0;
  const baseNightsAmount =
    booking?.room?.price_per_night && booking?.number_of_nights > 0
      ? Number(booking.room.price_per_night) * Number(booking.number_of_nights)
      : grossAmount;
  const weekendAdjustmentAmount = Math.max(0, Math.round(grossAmount - baseNightsAmount));
  const roomAmountBeforeTax = Math.max(0, amountPayable - weekendAdjustmentAmount);
  
  // Generate VietQR API URL
  // Format: https://img.vietqr.io/image/{acqId}-{accountNo}-{template}.png
  // Use template 'qr_only' to get QR code only without logo
  const vietQRUrl = (() => {
    if (!booking) return null;
    
    // Use 'qr_only' template to get plain QR code without logo
    const baseUrl = `https://img.vietqr.io/image/${bankAccount.bankBin}-${bankAccount.number}-qr_only.png`;
    const params = new URLSearchParams();
    
    // Amount in VND (sau giảm giá voucher nếu có)
    if (amountPayable > 0) {
      params.append('amount', String(Math.round(amountPayable)));
    }
    
    // Payment content (booking ID)
    if (paymentContent) {
      params.append('addInfo', paymentContent);
    }
    
    // Account name (remove Vietnamese accents and convert to uppercase)
    // VietQR requires account name without accents and in uppercase
    const accountName = bankAccount.owner
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toUpperCase()
      .trim();
    
    if (accountName) {
      params.append('accountName', accountName);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  })();

  useEffect(() => {
    // Reset QR loading state when URL changes (new booking / reload)
    setIsQrLoaded(false);
  }, [vietQRUrl]);

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankAccount.number);
    setIsCopied(true);
    toast({
      title: t.payment.copied,
      description: t.payment.accountNumberCopied,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyPaymentContent = () => {
    navigator.clipboard.writeText(paymentContent);
    toast({
      title: t.payment.copied,
      description: t.payment.transferContentCopied,
    });
  };

  // OnePay - Coming Soon (commented out)
  // const handlePayWithOnePay = () => {
  //   if (!bookingId) return;
  //   router.push(`/checkout/onepay/redirect?booking_id=${bookingId}`);
  // };


  if (!bookingId) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{t.payment.notFound}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1">
          <PaymentSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : t.payment.notFound}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: dateLocale });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: dateLocale });
  };

  return (
    <div className="min-h-screen bg-luxury-gradient flex flex-col">
      <Navigation />
      <main className="pt-14 lg:pt-16 flex-1">
        <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gradient-section">
          <div className="container-luxury">
            {/* Header */}
            <div className="mb-8 md:mb-12">
              <div className="text-center mb-6 md:mb-8 px-1">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
                  <Banknote className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 md:mb-4">
                  {t.payment.title}
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t.payment.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column - Payment Info */}
              <div className="lg:col-span-2 space-y-6">
                <GradientBorder>
                  <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                    <CardHeader className="p-4 sm:p-6 md:p-8 pb-0 space-y-0">
                      <div className="mb-4 md:mb-1">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl font-display">
                          {t.payment.transferInfo}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 md:p-8 pt-2 md:pt-1 space-y-4 sm:space-y-6">
                      {/* QR Code Section */}
                      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                        {/* QR Code - Only QR */}
                        <div className="flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl border-2 border-primary/30 shadow-lg relative w-full max-w-[360px] h-[min(280px,calc(100vw-2rem))] sm:h-[320px] md:h-[360px] mx-auto md:mx-0 shrink-0">
                          {vietQRUrl && (
                            <>
                              {!isQrLoaded && (
                                <div className="absolute inset-4 sm:inset-6 flex items-center justify-center">
                                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-muted-foreground" />
                                </div>
                              )}
                              <Image
                                src={vietQRUrl}
                                alt="VietQR Code"
                                width={360}
                                height={360}
                                className={cn(
                                  "w-full h-full object-contain rounded-lg transition-opacity duration-300",
                                  !isQrLoaded && "opacity-0"
                                )}
                                unoptimized
                                priority
                                onLoadingComplete={() => setIsQrLoaded(true)}
                              />
                            </>
                          )}
                          {!vietQRUrl && (
                            <div className="w-full max-w-[360px] min-h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Bank Account Info */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">{t.payment.accountNumber}</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-xl text-foreground">{bankAccount.number}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopyAccountNumber}
                                  className="flex-shrink-0"
                                >
                                  <Copy className={cn("h-4 w-4", isCopied && "text-green-500")} />
                                </Button>
                              </div>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">{t.payment.bank}</p>
                              <p className="font-semibold text-lg text-foreground">{bankAccount.bank}</p>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">{t.payment.accountHolder}</p>
                              <p className="font-semibold text-lg text-foreground">{bankAccount.owner}</p>
                            </div>

                            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                              <p className="text-sm text-muted-foreground mb-2">{t.payment.transferContent}</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-base sm:text-xl text-primary break-all">{paymentContent}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopyPaymentContent}
                                  className="flex-shrink-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm font-semibold text-foreground mt-3 inline-block px-2 py-1 bg-yellow-200 dark:bg-yellow-900/30 rounded">
                                {t.payment.transferContentWarning}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Amount */}
                      <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">{t.payment.amountToPay}</p>
                            <p className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(amountPayable)}đ</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm text-muted-foreground mb-1">{t.payment.bookingCode}</p>
                            <p className="text-base sm:text-lg font-mono font-bold text-foreground break-all">{paymentContent}</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="font-semibold text-foreground mb-2">
                          {t.payment.instructions}
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                          <li>{t.payment.step1}</li>
                          <li>{t.payment.step2}</li>
                          <li>{t.payment.step3.replace('{amount}', formatPrice(amountPayable))}</li>
                          <li>{t.payment.step4.replace('{content}', paymentContent)}</li>
                          <li>{t.payment.step5}</li>
                          <li>{t.payment.step6}</li>
                        </ol>
                        <div className="mt-3 pt-3 border-t border-primary/20">
                          <p className="text-xs text-muted-foreground">
                            {t.payment.qrNote}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* OnePay - Coming Soon (commented out) */}
                      {/* 
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          {t.payment.onepayTitle}
                        </p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                          {t.payment.onepayDescription}
                        </p>
                        <Button
                          onClick={handlePayWithOnePay}
                          disabled={!canProceedPayment}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {t.payment.onepayButton}
                        </Button>
                      </div>
                      */}
                    </CardContent>
                  </FloatingCard>
                </GradientBorder>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <GradientBorder>
                    <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                      <CardHeader className="p-4 sm:p-6 md:p-8 pb-0 space-y-0">
                        <div className="mb-4">
                          <CardTitle className="text-lg sm:text-xl md:text-2xl font-display">
                            {t.payment.bookingInfo}
                          </CardTitle>
                        </div>
                        {/* Booking ID */}
                        <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4 md:mb-0">
                          <div className="absolute top-3 right-3">
                            <BookingStatusBadge status={booking.status} useCheckoutLabel={false} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{t.payment.bookingCode}</p>
                          <p className="font-mono font-bold text-base sm:text-xl text-primary pr-20 sm:pr-24 break-all">{booking?.booking_code || paymentContent}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6 md:px-8 pb-6 md:pb-8 pt-4 md:pt-0 space-y-4">
                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Check-in */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.payment.checkIn}</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_in)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_in)}</p>
                          </div>
                          
                          {/* Check-out */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.payment.checkOut}</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_out)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_out)}</p>
                          </div>
                          
                          {/* Guests */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Users className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.payment.guests}</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.total_guests} {t.payment.guestsUnit}</p>
                          </div>
                          
                          {/* Nights */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.payment.nights}</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.number_of_nights} {t.payment.nightsUnit}</p>
                          </div>
                        </div>

                        {/* Customer Information Section */}
                        {booking.customer && (
                          <div>
                            <h3 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                              <User className="h-5 w-5 text-primary" />
                              {t.payment.customerInfo}
                            </h3>
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground mb-1">{t.payment.fullName}</p>
                                    <p className="font-semibold text-foreground break-words">{booking.customer.full_name}</p>
                                </div>
                              </div>
                              
                              {booking.customer.email && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Mail className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground mb-1">{t.payment.email}</p>
                                    <p className="font-medium text-foreground break-all">{booking.customer.email}</p>
                                  </div>
                                </div>
                              )}
                              
                              {booking.customer.phone && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Phone className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground mb-1">{t.payment.phone}</p>
                                    <p className="font-medium text-foreground break-all">{booking.customer.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Booking Details Section (no title) */}
                        <div className="space-y-2">
                          {booking.room && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-0.5">{t.payment.roomBooked}</p>
                                  <p className="font-semibold text-foreground">{booking.room.name}</p>
                                  {booking.room.room_type && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {t.payment.roomType} {booking.room.room_type}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {booking.notes && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">{t.payment.specialNotes}</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator className="my-4" />

                        {/* Payment Summary */}
                        <div>
                          <h3 className="text-lg font-display font-semibold mb-3">{t.payment.paymentSummary}</h3>
                          <div className="space-y-2">
                            <div className="rounded-xl border border-border/70 bg-background/90 shadow-sm p-3.5 space-y-2.5">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">
                                  {language === "vi"
                                    ? "Phòng (giá gốc/tạm tính)"
                                    : language === "zh"
                                      ? "房费（基础价/暂估）"
                                      : "Room (base/estimated)"}
                                </span>
                                <span className="font-medium tabular-nums">{formatPrice(roomAmountBeforeTax)}đ</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{t.checkout.tax}</span>
                                <span className="font-medium tabular-nums">{formatPrice(weekendAdjustmentAmount)}đ</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-border/70">
                                <span className="font-semibold text-lg">{t.payment.total}</span>
                                <span className="font-bold text-xl text-primary">{formatPrice(amountPayable)}đ</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {language === "vi"
                                  ? "Giá đã bao gồm thuế và các phí liên quan"
                                  : language === "zh"
                                    ? "价格已包含税费及相关费用"
                                    : "Price includes taxes and applicable fees"}
                              </p>
                            </div>
                            {voucherDiscount > 0 && (
                              <div className="flex justify-between items-center text-sm text-emerald-700 dark:text-emerald-400">
                                <span>
                                  {t.checkout.discount}
                                  {booking.voucher_code ? ` (${booking.voucher_code})` : ""}
                                </span>
                                <span className="font-medium">−{formatPrice(voucherDiscount)}đ</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        {canProceedPayment && countdown > 0 && (
                          <div className="w-full p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <Clock className="h-8 w-8 text-primary animate-pulse" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{t.payment.waitingPayment}</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                {t.payment.autoConfirm}
                              </p>
                              <div className="text-3xl font-bold text-primary font-mono">
                                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {t.payment.checkingPayment}
                              </p>
                            </div>
                          </div>
                        )}

                        {!canProceedPayment && (
                          <div className="w-full p-4 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-center text-muted-foreground">
                              {t.payment.processed}
                            </p>
                          </div>
                        )}
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
};

const PaymentPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <PaymentSkeleton />
        </main>
        <Footer />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;

