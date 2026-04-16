"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "@/components/ui/safe-image";

interface CategoryPageProps {
  params: Promise<{ code: string }>;
}

/**
 * This page redirects from category code to a sample room of that category
 * Used when displaying rooms by category instead of individual rooms
 */
export default function CategoryPage({ params }: CategoryPageProps) {
  const unwrappedParams = use(params);
  const { code } = unwrappedParams;
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectToSampleRoom = async () => {
      try {
        // Find a room with this category_code
        const { data: rooms, error } = await supabase
          .from('rooms')
          .select('id')
          .eq('category_code', code)
          .is('deleted_at', null)
          .limit(1);

        if (error) {
          console.error('Error finding room:', error);
          router.push('/rooms');
          return;
        }

        if (!rooms || rooms.length === 0) {
          console.error('No room found for category:', code);
          router.push('/rooms');
          return;
        }

        // Redirect to the sample room with date params if available
        const checkIn = searchParams.get('check_in');
        const checkOut = searchParams.get('check_out');
        const queryString = checkIn && checkOut 
          ? `?check_in=${checkIn}&check_out=${checkOut}`
          : '';
        
        router.push(`/rooms/${rooms[0].id}${queryString}`);
      } catch (error) {
        console.error('Error redirecting:', error);
        router.push('/rooms');
      }
    };

    redirectToSampleRoom();
  }, [code, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground">
      <div className="text-center px-4">
        {/* Logo */}
        <div className="relative w-96 h-96 mx-auto -mb-16">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
