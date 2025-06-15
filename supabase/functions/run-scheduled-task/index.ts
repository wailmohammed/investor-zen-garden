
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Create a Supabase client
const supabaseUrl = 'https://tngtalojrxengqqrkcwl.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to execute a scheduled task
const executeTask = async (taskName: string): Promise<string> => {
  console.log(`Executing scheduled task: ${taskName}`)
  
  // Different task logic based on task name
  switch (taskName) {
    case 'daily-user-report':
      // Generate a daily report (simulated)
      console.log('Generating daily user report')
      return 'Daily user report generated'
      
    case 'market-data-sync':
      // Sync market data (simulated)
      console.log('Syncing market data')
      return 'Market data synced'
      
    case 'payment-reminders':
      // Send payment reminders (simulated)
      console.log('Sending payment reminders')
      return 'Payment reminders sent'
      
    case 'dividend-detection-scan':
      // Run dividend detection for all eligible portfolios
      console.log('Running dividend detection scan')
      try {
        const { data, error } = await supabase.functions.invoke('dividend-detection', {
          body: { runAll: true }
        });
        
        if (error) throw error;
        
        console.log('Dividend detection completed:', data);
        return `Dividend detection completed: ${data.results?.length || 0} portfolios processed`;
      } catch (error) {
        console.error('Error in dividend detection:', error);
        return `Dividend detection failed: ${error.message}`;
      }
      
    default:
      console.log(`Unknown task: ${taskName}`)
      return `Unknown task: ${taskName}`
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get tasks that need to be run (now >= next_run)
    const now = new Date().toISOString()
    const { data: tasks, error } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .lte('next_run', now)
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // If no tasks need to run
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ message: 'No tasks to run' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Execute all tasks and collect results
    const results = await Promise.all(tasks.map(async (task) => {
      const result = await executeTask(task.name)
      
      // Calculate the next run time based on frequency
      let nextRun = new Date()
      switch (task.frequency) {
        case 'hourly':
          nextRun.setHours(nextRun.getHours() + 1)
          break
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1)
          break
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7)
          break
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1)
          break
        case 'every-6-hours':
          nextRun.setHours(nextRun.getHours() + 6)
          break
        default:
          // Default to daily
          nextRun.setDate(nextRun.getDate() + 1)
      }
      
      // Update the task with the result and new next_run time
      const { error: updateError } = await supabase
        .from('scheduled_tasks')
        .update({
          last_run: now,
          next_run: nextRun.toISOString()
        })
        .eq('id', task.id)
      
      if (updateError) {
        console.error(`Error updating task ${task.id}:`, updateError)
      }
      
      return {
        taskId: task.id,
        taskName: task.name,
        result,
        success: !updateError
      }
    }))
    
    return new Response(JSON.stringify({ tasksExecuted: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
