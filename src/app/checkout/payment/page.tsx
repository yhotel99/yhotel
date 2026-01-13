"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Calendar, 
  Users, 
  ArrowLeft,
  Building2,
  Clock,
  User,
  Banknote,
  CheckCircle,
  Copy,
  Loader2,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { RoomDetailSkeleton } from "@/components/RoomDetailSkeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { BOOKING_STATUS, bookingStatusLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import { BANK_BIN_CODES } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
  const [subscriptionKey, setSubscriptionKey] = useState(0); // Force re-subscription on retry

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
        throw new Error('Không tìm thấy thông tin đặt phòng');
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
  }, [booking?.status, bookingId, router]);

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
                  title: "Trạng thái đặt phòng đã thay đổi",
                  description: `Từ "${oldStatusLabel}" sang "${newStatusLabel}"`,
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
                    title: "Thanh toán thành công!",
                    description: "Đặt phòng của bạn đã được xác nhận. Đang chuyển hướng...",
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
                    title: "Đặt phòng đã bị hủy",
                    description: "Vui lòng liên hệ với chúng tôi nếu bạn có thắc mắc.",
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
              title: "Kết nối cập nhật thời gian thực không khả dụng",
              description: "Trang sẽ tự động làm mới để kiểm tra trạng thái đặt phòng.",
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

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes
  const [isCancelling, setIsCancelling] = useState(false);

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
          title: "Hết thời gian thanh toán",
          description: "Đặt phòng đã bị hủy do quá thời gian chờ thanh toán. Vui lòng đặt lại phòng.",
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
          title: "Lỗi hệ thống",
          description: "Không thể hủy đặt phòng. Vui lòng liên hệ hỗ trợ.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Lỗi hệ thống",
        description: "Đã xảy ra lỗi khi hủy đặt phòng.",
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
    number: "22102003",
    bank: "ACB",
    bankBin: BANK_BIN_CODES["ACB"] || "970416", // ACB BIN code
    owner: "TRAN QUANG KHAI"
  };

  // Use booking_code if available, otherwise fallback to booking ID
  // Use booking_code from database (format: YH20251230000001)
  // Fallback to booking ID if booking_code is not available
  const paymentContent = booking?.booking_code || (bookingId ? bookingId.slice(0, 8).toUpperCase() : "");
  
  // Generate VietQR API URL
  // Format: https://img.vietqr.io/image/{acqId}-{accountNo}-{template}.png
  // Use template 'qr_only' to get QR code only without logo
  const vietQRUrl = (() => {
    if (!booking) return null;
    
    // Use 'qr_only' template to get plain QR code without logo
    const baseUrl = `https://img.vietqr.io/image/${bankAccount.bankBin}-${bankAccount.number}-qr_only.png`;
    const params = new URLSearchParams();
    
    // Amount in VND
    if (booking.total_amount) {
      params.append('amount', booking.total_amount.toString());
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

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankAccount.number);
    setIsCopied(true);
    toast({
      title: "Đã sao chép",
      description: "Số tài khoản đã được sao chép vào clipboard",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyPaymentContent = () => {
    navigator.clipboard.writeText(paymentContent);
    toast({
      title: "Đã sao chép",
      description: "Nội dung chuyển khoản đã được sao chép",
    });
  };


  if (!bookingId) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Không tìm thấy thông tin đặt phòng</p>
                  <Button onClick={() => router.push('/book')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đặt phòng
                  </Button>
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
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <RoomDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : "Không tìm thấy thông tin đặt phòng"}
                  </p>
                  <Button onClick={() => router.push('/book')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đặt phòng
                  </Button>
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
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: vi });
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            {/* Header */}
            <div className="mb-12">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Banknote className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Chuyển Khoản Ngân Hàng
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Info */}
              <div className="lg:col-span-2 space-y-6">
                <GradientBorder>
                  <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                    <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                      <div className="mb-4 md:mb-1">
                        <CardTitle className="text-xl md:text-2xl font-display">
                          Thông Tin Chuyển Khoản
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-2 md:pt-1 space-y-6">
                      {/* QR Code Section */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* QR Code - Only QR */}
                        <div className="flex items-center justify-center p-6 bg-white rounded-xl border-2 border-primary/30 shadow-lg">
                          {vietQRUrl ? (
                            <Image
                              src={vietQRUrl}
                              alt="VietQR Code"
                              width={400}
                              height={400}
                              className="w-full max-w-[400px] h-auto aspect-square"
                              unoptimized
                              priority
                            />
                          ) : (
                            <div className="w-full max-w-[400px] aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
                              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Bank Account Info */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">Số tài khoản</p>
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
                              <p className="text-sm text-muted-foreground mb-2">Ngân hàng</p>
                              <p className="font-semibold text-lg text-foreground">{bankAccount.bank}</p>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">Chủ tài khoản</p>
                              <p className="font-semibold text-lg text-foreground">{bankAccount.owner}</p>
                            </div>

                            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                              <p className="text-sm text-muted-foreground mb-2">Nội dung chuyển khoản</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-xl text-primary">{paymentContent}</span>
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
                                ⚠️ Quan trọng: Vui lòng ghi đúng nội dung để chúng tôi xác nhận thanh toán nhanh nhất
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Amount */}
                      <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Số tiền cần chuyển</p>
                            <p className="text-2xl font-bold text-primary">{formatPrice(booking.total_amount)}đ</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Mã đặt phòng</p>
                            <p className="text-lg font-mono font-bold text-foreground">{paymentContent}</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Hướng dẫn thanh toán:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                          <li>Mở ứng dụng ngân hàng trên điện thoại (hỗ trợ tất cả ngân hàng tại Việt Nam)</li>
                          <li>Chọn tính năng quét mã QR và quét mã VietQR bên trên</li>
                          <li>Kiểm tra thông tin: số tiền {formatPrice(booking.total_amount)}đ, nội dung chuyển khoản {paymentContent}</li>
                          <li>Xác nhận và hoàn tất giao dịch</li>
                          <li>Chờ hệ thống tự động xác nhận thanh toán (trong vòng 15 phút)</li>
                          <li>Chúng tôi sẽ gửi email xác nhận thanh toán thành công trong vài phút</li>
                        </ol>
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            💡 <strong>Lưu ý:</strong> Mã VietQR tương thích với tất cả các ứng dụng ngân hàng tại Việt Nam. 
                            Nếu không quét được QR, bạn có thể chuyển khoản thủ công theo thông tin tài khoản bên trên.
                          </p>
                        </div>
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
                      <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                        <div className="mb-4">
                          <CardTitle className="text-xl md:text-2xl font-display">
                            Thông Tin Đặt Phòng
                          </CardTitle>
                        </div>
                        {/* Booking ID */}
                        <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4 md:mb-0">
                          <div className="absolute top-3 right-3">
                            <BookingStatusBadge status={booking.status} useCheckoutLabel={false} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">Mã đặt phòng</p>
                          <p className="font-mono font-bold text-xl text-primary pr-24">{booking?.booking_code || paymentContent}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 md:px-8 pb-6 md:pb-8 pt-4 md:pt-0 space-y-4">
                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Check-in */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Nhận phòng</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_in)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_in)}</p>
                          </div>
                          
                          {/* Check-out */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Trả phòng</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_out)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_out)}</p>
                          </div>
                          
                          {/* Guests */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Users className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Số khách</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.total_guests} người</p>
                          </div>
                          
                          {/* Nights */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Số đêm</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.number_of_nights} đêm</p>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Customer Information Section */}
                        {booking.customer && (
                          <div>
                            <h3 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                              <User className="h-5 w-5 text-primary" />
                              Thông Tin Khách Hàng
                            </h3>
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">Họ và tên</p>
                                  <p className="font-semibold text-foreground">{booking.customer.full_name}</p>
                                </div>
                              </div>
                              
                              {booking.customer.email && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Mail className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                    <p className="font-medium text-foreground">{booking.customer.email}</p>
                                  </div>
                                </div>
                              )}
                              
                              {booking.customer.phone && (
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Phone className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">Số điện thoại</p>
                                    <p className="font-medium text-foreground">{booking.customer.phone}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <Separator className="my-4" />

                        {/* Booking Details Section */}
                        <div>
                          <h3 className="text-lg font-display font-semibold mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Chi Tiết Đặt Phòng
                          </h3>
                          <div className="space-y-2">
                            {booking.room && (
                              <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <Building2 className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-0.5">Phòng đã đặt</p>
                                    <p className="font-semibold text-foreground">{booking.room.name}</p>
                                    {booking.room.room_type && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        Loại phòng: {booking.room.room_type}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {booking.notes && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Ghi chú đặc biệt</p>
                                    <p className="text-sm text-blue-900 dark:text-blue-100">{booking.notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Payment Summary */}
                        <div>
                          <h3 className="text-lg font-display font-semibold mb-3">Tổng Thanh Toán</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Giá phòng</span>
                              <span className="font-medium">{formatPrice(booking.total_amount)}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>{booking.number_of_nights} đêm × {formatPrice(booking.total_amount / booking.number_of_nights)}đ</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-semibold text-lg">Tổng cộng</span>
                              <span className="font-bold text-xl text-primary">{formatPrice(booking.total_amount)}đ</span>
                            </div>
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        {canProceedPayment && countdown > 0 && (
                          <div className="w-full p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                                <Clock className="h-8 w-8 text-primary animate-pulse" />
                              </div>
                              <h3 className="text-lg font-semibold mb-2">Đang chờ thanh toán</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Hệ thống sẽ tự động xác nhận sau:
                              </p>
                              <div className="text-3xl font-bold text-primary font-mono">
                                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Chúng tôi sẽ kiểm tra thanh toán và xác nhận đặt phòng của bạn
                              </p>
                            </div>
                          </div>
                        )}

                        {!canProceedPayment && (
                          <div className="w-full p-4 bg-muted/30 rounded-lg border border-border/50">
                            <p className="text-center text-muted-foreground">
                              Đơn đặt phòng đã được xử lý
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
          <RoomDetailSkeleton />
        </main>
        <Footer />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;

