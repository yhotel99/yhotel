import { Building2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookingRoom {
  id: string;
  room_id: string;
  amount: number;
  rooms: {
    id: string;
    name: string;
    room_type?: string;
  };
}

interface BookingRoomsListProps {
  bookingRooms: BookingRoom[];
  nights: number;
}

export const BookingRoomsList = ({ bookingRooms, nights }: BookingRoomsListProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  // Group rooms by room_id to show quantity
  const groupedRooms = bookingRooms.reduce((acc, room) => {
    const existing = acc.find(r => r.room_id === room.room_id);
    if (existing) {
      existing.quantity += 1;
      existing.totalAmount += room.amount;
    } else {
      acc.push({
        room_id: room.room_id,
        room_name: room.rooms.name,
        room_type: room.rooms.room_type,
        amount: room.amount,
        totalAmount: room.amount,
        quantity: 1,
      });
    }
    return acc;
  }, [] as Array<{
    room_id: string;
    room_name: string;
    room_type?: string;
    amount: number;
    totalAmount: number;
    quantity: number;
  }>);

  return (
    <div className="space-y-2">
      {groupedRooms.map((room) => (
        <div key={room.room_id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-semibold text-foreground">{room.room_name}</p>
                {room.quantity > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    x{room.quantity}
                  </Badge>
                )}
              </div>
              {room.room_type && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{room.room_type}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {formatPrice(room.amount / nights)}đ/đêm × {nights} đêm
                {room.quantity > 1 && ` × ${room.quantity} phòng`}
              </p>
              <p className="text-sm font-semibold text-primary mt-1">
                {formatPrice(room.totalAmount)}đ
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
