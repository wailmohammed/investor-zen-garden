
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id?: string;
  message: string;
  response: string;
  isLoading?: boolean;
}

const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch previous chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Display messages in chronological order
          setMessages(data.reverse());
        }
      } catch (error: any) {
        console.error('Error fetching chat history:', error.message);
      }
    };
    
    fetchChatHistory();
  }, [user]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the AI chat feature.",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage = input;
    setInput('');
    
    // Add optimistic message
    setMessages(prev => [...prev, { 
      message: userMessage, 
      response: '', 
      isLoading: true 
    }]);
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: userMessage,
          userId: user?.id
        }
      });
      
      if (error) throw error;
      
      // Update message with response
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 
          ? { message: msg.message, response: data.response } 
          : msg
      ));
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      toast({
        title: "Failed to send message",
        description: "There was an error communicating with the AI assistant.",
        variant: "destructive",
      });
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter((_, index) => index !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Financial Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-[400px] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>No messages yet. Ask me anything about finance!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || index} className="space-y-2">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-semibold">You</p>
                  <p>{msg.message}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="font-semibold">AI Assistant</p>
                  {msg.isLoading ? (
                    <div className="animate-pulse">Thinking...</div>
                  ) : (
                    <p>{msg.response}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="flex items-center space-x-2">
        <Textarea
          placeholder="Ask about dividends, stocks, or other financial topics..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
