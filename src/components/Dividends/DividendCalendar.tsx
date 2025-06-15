
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

interface DividendEvent {
  id: string;
  symbol: string;
  company: string;
  type: 'ex-date' | 'payment-date';
  date: Date;
  amount: number;
  estimatedIncome: number;
}

const DividendCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock dividend events
  const dividendEvents: DividendEvent[] = [
    {
      id: "1",
      symbol: "AAPL",
      company: "Apple Inc.",
      type: "ex-date",
      date: new Date(2025, 5, 9), // June 9, 2025
      amount: 0.24,
      estimatedIncome: 12.00
    },
    {
      id: "2",
      symbol: "AAPL",
      company: "Apple Inc.",
      type: "payment-date",
      date: new Date(2025, 5, 16), // June 16, 2025
      amount: 0.24,
      estimatedIncome: 12.00
    },
    {
      id: "3",
      symbol: "MSFT",
      company: "Microsoft Corporation",
      type: "ex-date",
      date: new Date(2025, 5, 15), // June 15, 2025
      amount: 0.75,
      estimatedIncome: 37.50
    },
    {
      id: "4",
      symbol: "JNJ",
      company: "Johnson & Johnson",
      type: "payment-date",
      date: new Date(2025, 5, 10), // June 10, 2025
      amount: 1.19,
      estimatedIncome: 59.50
    }
  ];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return dividendEvents.filter(event => isSameDay(event.date, day));
  };

  const totalMonthlyIncome = dividendEvents
    .filter(event => 
      event.type === 'payment-date' && 
      isSameMonth(event.date, currentDate)
    )
    .reduce((sum, event) => sum + event.estimatedIncome, 0);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expected This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalMonthlyIncome.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Ex-Dividend Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Payment Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm">Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const events = getEventsForDay(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[100px] p-2 border rounded-lg transition-colors
                    ${isCurrentDay ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-gray-50'}
                    ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-2 ${isCurrentDay ? 'text-yellow-800' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-xs p-1 rounded text-white cursor-pointer
                          ${event.type === 'ex-date' ? 'bg-blue-500' : 'bg-green-500'}
                        `}
                        title={`${event.symbol} - ${event.type === 'ex-date' ? 'Ex-Date' : 'Payment'}: $${event.estimatedIncome}`}
                      >
                        <div className="font-medium">{event.symbol}</div>
                        <div className="opacity-90">${event.estimatedIncome.toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Events This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dividendEvents
              .filter(event => isSameMonth(event.date, currentDate))
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded ${event.type === 'ex-date' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                    <div>
                      <div className="font-medium">{event.symbol}</div>
                      <div className="text-sm text-muted-foreground">{event.company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{format(event.date, 'MMM d')}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.type === 'ex-date' ? 'Ex-Date' : 'Payment'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">${event.estimatedIncome.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">${event.amount}/share</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { DividendCalendar };
