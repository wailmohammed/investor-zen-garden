
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";

interface DividendEvent {
  id: string;
  symbol: string;
  company: string;
  amount: number;
  exDate: string;
  payDate: string;
  type: 'upcoming' | 'received' | 'past';
}

const DividendCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dividendEvents, setDividendEvents] = useState<DividendEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Mock dividend events - in real app this would come from API
    const mockEvents: DividendEvent[] = [
      {
        id: '1',
        symbol: 'AAPL',
        company: 'Apple Inc.',
        amount: 0.24,
        exDate: '2024-02-09',
        payDate: '2024-02-15',
        type: 'upcoming'
      },
      {
        id: '2',
        symbol: 'MSFT',
        company: 'Microsoft Corp.',
        amount: 0.75,
        exDate: '2024-02-21',
        payDate: '2024-03-14',
        type: 'upcoming'
      },
      {
        id: '3',
        symbol: 'KO',
        company: 'Coca-Cola Co.',
        amount: 0.46,
        exDate: '2024-02-28',
        payDate: '2024-04-01',
        type: 'upcoming'
      }
    ];
    setDividendEvents(mockEvents);
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return dividendEvents.filter(event => {
      const exDate = parseISO(event.exDate);
      const payDate = parseISO(event.payDate);
      return format(exDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ||
             format(payDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  const totalUpcomingDividends = dividendEvents
    .filter(event => event.type === 'upcoming')
    .reduce((sum, event) => sum + event.amount, 0);

  const nextDividendDate = dividendEvents
    .filter(event => event.type === 'upcoming')
    .sort((a, b) => new Date(a.exDate).getTime() - new Date(b.exDate).getTime())[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expected</p>
                <p className="text-2xl font-bold">${totalUpcomingDividends.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="text-lg font-semibold">
                  {nextDividendDate ? format(parseISO(nextDividendDate.payDate), 'MMM dd') : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Stocks</p>
                <p className="text-2xl font-bold">{dividendEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Dividend Calendar</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                Next
              </Button>
            </div>
          </div>
          <p className="text-lg font-medium">{format(currentDate, 'MMMM yyyy')}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map(day => {
              const events = getEventsForDate(day);
              const hasEvents = events.length > 0;
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    p-2 min-h-[80px] border rounded cursor-pointer transition-colors
                    ${isToday(day) ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'}
                    ${hasEvents ? 'border-green-200 bg-green-50' : ''}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  {events.slice(0, 2).map(event => (
                    <Badge 
                      key={event.id} 
                      variant="secondary" 
                      className="text-xs mb-1 block truncate"
                    >
                      {event.symbol}
                    </Badge>
                  ))}
                  {events.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{events.length - 2} more
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Events for {format(selectedDate, 'MMMM dd, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{event.symbol} - {event.company}</h4>
                      <p className="text-sm text-muted-foreground">
                        Ex-Date: {format(parseISO(event.exDate), 'MMM dd')} | 
                        Pay Date: {format(parseISO(event.payDate), 'MMM dd')}
                      </p>
                    </div>
                    <Badge variant={event.type === 'upcoming' ? 'default' : 'secondary'}>
                      ${event.amount}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No dividend events on this date.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DividendCalendar;
