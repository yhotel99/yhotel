import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Mark as dynamic route since we use request.url for query params
export const dynamic = 'force-dynamic';

// Cache for 5 minutes
export const revalidate = 300;

export interface DashboardStats {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  total_bookings: number;
  active_bookings: number;
  total_customers: number;
  total_revenue: number;
  monthly_revenue: number;
  occupancy_rate: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  bookings: number;
}

export interface OccupancyChartData {
  date: string;
  occupancy_rate: number;
  available_rooms: number;
  occupied_rooms: number;
}

/**
 * GET /api/dashboard
 * Get dashboard statistics and analytics
 * Query parameters:
 *   - period: 'today', 'week', 'month', 'year' (default: 'month')
 *   - include_charts: 'true' to include chart data (default: false)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const includeCharts = searchParams.get('include_charts') === 'true';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const startDateStr = startDate.toISOString();

    // Get room statistics
    const { data: rooms } = await supabase
      .from('rooms')
      .select('status')
      .is('deleted_at', null);

    const totalRooms = rooms?.length || 0;
    const availableRooms = rooms?.filter(r => r.status === 'available' || r.status === 'clean').length || 0;
    const occupiedRooms = rooms?.filter(r => r.status === 'occupied').length || 0;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    // Get booking statistics
    const { data: allBookings } = await supabase
      .from('bookings')
      .select('id, status, total_amount, created_at')
      .is('deleted_at', null);

    const totalBookings = allBookings?.length || 0;
    const activeBookings = allBookings?.filter(b =>
      ['pending', 'confirmed', 'checked_in'].includes(b.status)
    ).length || 0;

    // Get period bookings for revenue calculation
    const { data: periodBookings } = await supabase
      .from('bookings')
      .select('total_amount, created_at')
      .is('deleted_at', null)
      .eq('status', 'checked_out')
      .gte('updated_at', startDateStr);

    const totalRevenue = periodBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

    // Get customer count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get monthly revenue for current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const { data: monthlyBookings } = await supabase
      .from('bookings')
      .select('total_amount')
      .is('deleted_at', null)
      .eq('status', 'checked_out')
      .gte('updated_at', currentMonthStart.toISOString());

    const monthlyRevenue = monthlyBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

    const stats: DashboardStats = {
      total_rooms: totalRooms,
      available_rooms: availableRooms,
      occupied_rooms: occupiedRooms,
      total_bookings: totalBookings,
      active_bookings: activeBookings,
      total_customers: totalCustomers || 0,
      total_revenue: totalRevenue,
      monthly_revenue: monthlyRevenue,
      occupancy_rate: Math.round(occupancyRate * 100) / 100, // Round to 2 decimal places
    };

    interface DashboardResponse {
      stats: DashboardStats;
      period: string;
      charts?: {
        revenue: RevenueChartData[];
        occupancy: OccupancyChartData[];
      };
    }

    const response: DashboardResponse = {
      stats,
      period,
    };

    // Include chart data if requested
    if (includeCharts) {
      // Revenue chart data (last 12 months)
      const revenueChartData: RevenueChartData[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = date.toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data: monthBookings } = await supabase
          .from('bookings')
          .select('total_amount')
          .is('deleted_at', null)
          .eq('status', 'checked_out')
          .gte('updated_at', monthStart)
          .lte('updated_at', monthEnd);

        const revenue = monthBookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
        const bookingsCount = monthBookings?.length || 0;

        revenueChartData.push({
          month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
          revenue,
          bookings: bookingsCount,
        });
      }

      // Occupancy chart data (last 30 days)
      const occupancyChartData: OccupancyChartData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];

        // Get bookings for this date
        const { data: dayBookings } = await supabase
          .from('bookings')
          .select('id')
          .is('deleted_at', null)
          .in('status', ['confirmed', 'checked_in'])
          .lte('check_in', dateStr)
          .gte('check_out', dateStr);

        const occupiedCount = dayBookings?.length || 0;
        const availableCount = totalRooms - occupiedCount;
        const rate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;

        occupancyChartData.push({
          date: date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
          occupancy_rate: Math.round(rate * 100) / 100,
          available_rooms: availableCount,
          occupied_rooms: occupiedCount,
        });
      }

      response.charts = {
        revenue: revenueChartData,
        occupancy: occupancyChartData,
      };
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
