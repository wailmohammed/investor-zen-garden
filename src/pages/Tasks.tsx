
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ScheduledTask {
  id: string;
  name: string;
  frequency: string;
  last_run: string | null;
  next_run: string;
  created_at: string;
}

const Tasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [isCreating, setIsCreating] = useState(false);

  console.log("Tasks page - User:", user?.email);

  // Fetch scheduled tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) {
        console.log("No user - skipping tasks fetch");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching tasks for user:", user.id);

        const { data, error } = await supabase
          .from('scheduled_tasks')
          .select('*')
          .order('next_run', { ascending: true });
        
        if (error) {
          console.error('Error fetching tasks:', error);
          toast({
            title: "Error",
            description: "Failed to load scheduled tasks.",
            variant: "destructive",
          });
          setTasks([]);
        } else {
          console.log("Tasks loaded:", data?.length || 0);
          setTasks(data || []);
        }
      } catch (error: any) {
        console.error('Error fetching tasks:', error.message);
        toast({
          title: "Error",
          description: "Failed to load scheduled tasks.",
          variant: "destructive",
        });
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id, toast]);

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      toast({
        title: "Invalid input",
        description: "Task name is required.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    // Calculate the next run time based on frequency
    let nextRun = new Date();
    switch (frequency) {
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + 1);
        break;
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      default:
        nextRun.setDate(nextRun.getDate() + 1);
    }
    
    try {
      const { data, error } = await supabase
        .from('scheduled_tasks')
        .insert({
          name: taskName,
          frequency,
          next_run: nextRun.toISOString(),
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Task created",
        description: "The scheduled task has been created successfully.",
      });
      
      if (data && data.length > 0) {
        setTasks(prev => [...prev, data[0]]);
      }
      
      setTaskName('');
      setFrequency('daily');
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Failed to create task",
        description: error.message || "An error occurred while creating the task.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRunTasksManually = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('run-scheduled-task');
      
      if (error) throw error;
      
      toast({
        title: "Tasks executed",
        description: `${data.tasksExecuted} tasks were executed successfully.`,
      });
      
      // Refresh the task list
      const { data: updatedTasks, error: fetchError } = await supabase
        .from('scheduled_tasks')
        .select('*')
        .order('next_run', { ascending: true });
        
      if (!fetchError && updatedTasks) {
        setTasks(updatedTasks);
      }
    } catch (error: any) {
      console.error('Error running tasks:', error);
      toast({
        title: "Failed to run tasks",
        description: error.message || "An error occurred while running the tasks.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Tasks</h1>
          <p className="text-muted-foreground">Manage automated scheduled tasks</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Task Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Task</CardTitle>
              <CardDescription>
                Schedule a new automated task
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="taskName" className="text-sm font-medium">Task Name</label>
                <Input 
                  id="taskName" 
                  value={taskName} 
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter task name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="frequency" className="text-sm font-medium">Frequency</label>
                <Select
                  value={frequency}
                  onValueChange={setFrequency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleCreateTask} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
              <Button onClick={handleRunTasksManually} variant="outline">
                Run Tasks Now
              </Button>
            </CardFooter>
          </Card>
          
          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                View and manage scheduled tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No scheduled tasks yet
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Run</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>{task.frequency}</TableCell>
                          <TableCell>
                            {new Date(task.next_run).toLocaleString()}
                          </TableCell>
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

export default Tasks;
