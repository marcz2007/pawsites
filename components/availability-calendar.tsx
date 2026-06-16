"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isTentative: boolean;
  isToday: boolean;
}

type BookingStatus = "pending" | "confirmed" | "blocked";
interface ApiBooking {
  start: string;
  end: string;
  status: BookingStatus;
}

function toDateString(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function AvailabilityCalendar({
  tenantSlug,
  whatsapp,
}: {
  tenantSlug: string;
  whatsapp?: string;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const [tentativeDates, setTentativeDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/calendar?tenant=${encodeURIComponent(tenantSlug)}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { bookings: ApiBooking[] };
        const busy = new Set<string>();
        const tentative = new Set<string>();

        data.bookings?.forEach((b) => {
          const start = new Date(b.start);
          const end = new Date(b.end);
          const cursor = new Date(start);
          while (cursor < end) {
            const ds = toDateString(cursor);
            // pending -> tentative (orange); confirmed/blocked -> busy (red)
            if (b.status === "pending") tentative.add(ds);
            else busy.add(ds);
            cursor.setDate(cursor.getDate() + 1);
          }
        });

        setBusyDates(busy);
        setTentativeDates(tentative);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    load();
  }, [tenantSlug]);

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const ds = toDateString(date);
      const isTentative = tentativeDates.has(ds);
      const isBusy = busyDates.has(ds);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isAvailable: !isBusy && !isTentative,
        isTentative,
        isToday: date.getTime() === today.getTime(),
      });
    }
    return days;
  }, [currentDate, busyDates, tentativeDates]);

  const monthYear = currentDate.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const waHref = whatsapp ? `https://wa.me/${whatsapp}` : undefined;

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold">Availability</h3>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">{monthYear}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm pt-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-muted-foreground">Tentative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-muted-foreground">Booked</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading availability...</div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-[11px] sm:text-sm font-medium text-muted-foreground py-1.5 sm:py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`aspect-square flex items-center justify-center rounded-lg text-[12px] sm:text-sm cursor-pointer transition-all hover:scale-105 ${
                  day.isCurrentMonth ? "font-medium" : "text-muted-foreground/50"
                } ${day.isToday ? "ring-2 ring-primary" : ""} ${
                  day.isTentative
                    ? "bg-orange-500/20 text-orange-700"
                    : day.isAvailable
                    ? "bg-green-500/20 text-green-700"
                    : "bg-red-500/20 text-red-700"
                }`}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs sm:text-sm text-muted-foreground text-center pt-2">
          Green dates show when we're available for new bookings
        </p>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedDay(null)}>
          <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold">
              {selectedDay.date.toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            {selectedDay.isTentative ? (
              <p className="text-sm text-muted-foreground">
                This date is temporarily held while another client finalises arrangements. It may
                free up — check back later or get in touch.
              </p>
            ) : selectedDay.isAvailable ? (
              <div className="space-y-4">
                <p className="text-lg font-medium text-green-700">This day is available</p>
                <Button
                  onClick={() => {
                    setSelectedDay(null);
                    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full"
                >
                  Request to book this date
                </Button>
                {waHref ? (
                  <Button asChild variant="outline" className="w-full">
                    <a href={waHref} target="_blank" rel="noreferrer">
                      Ask on WhatsApp
                    </a>
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                We're already booked for this date. Please check other dates or get in touch about
                alternatives.
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
