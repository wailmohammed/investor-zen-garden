
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface EmailNotification {
  id: string;
  subject: string;
  content: string;
  status: string;
  created_at: string;
  sent_at: string | null;
}

const EmailNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch email notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('email_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setNotifications(data || []);
      } catch (error: any) {
        console.error('Error fetching notifications:', error.message);
        toast({
          title: "Error",
          description: "Failed to load email notifications.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user, toast]);

  const handleSendEmail = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send emails.",
        variant: "destructive",
      });
      return;
    }
    
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Invalid input",
        description: "Subject and content are required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          userId: user.id,
          subject,
          content,
          // In a real app, you might want to specify a different recipient
          // recipientEmail: user.email
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Email sent",
          description: "Your email notification has been sent successfully.",
        });
        
        // Clear the form
        setSubject('');
        setContent('');
        
        // Refresh the notifications list
        const { data: newNotifications, error: fetchError } = await supabase
          .from('email_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (!fetchError && newNotifications) {
          setNotifications(newNotifications);
        }
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: error.message || "An error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'sending':
        return <Badge className="bg-orange-500">Sending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Notifications</h1>
          <p className="text-muted-foreground">Send and manage email notifications</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Email Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send New Email</CardTitle>
              <CardDescription>
                Create and send a new email notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input 
                  id="subject" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">Content</label>
                <Textarea 
                  id="content" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter email content"
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendEmail} disabled={isSending}>
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Email History */}
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>
                View your sent and pending emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No email notifications yet
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell className="font-medium">{notification.subject}</TableCell>
                          <TableCell>
                            {new Date(notification.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(notification.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailNotifications;
