
import { TableReservationClient } from "@/components/admin/tableManagement/TableReservationClient";
import { CalendarCheck } from "lucide-react";

export default function TableReservationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <CalendarCheck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Table Reservation</h1>
      </div>
       <p className="text-muted-foreground">
        View floor layouts, check table availability, and manage reservations.
      </p>
      <div className="h-[1px] w-full bg-border" />
      <TableReservationClient />
    </div>
  );
}
