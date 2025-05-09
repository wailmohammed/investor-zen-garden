
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = 'https://tngtalojrxengqqrkcwl.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Mock email sending function (replace with actual email service in production)
const sendEmailNotification = async (recipient: string, subject: string, content: string): Promise<boolean> => {
  // In a real implementation, you would use an email service provider here
  console.log(`Sending email to ${recipient}:`)
  console.log(`Subject: ${subject}`)
  console.log(`Content: ${content}`)
  
  // This would be where you call your email service (SendGrid, AWS SES, etc.)
  // For now, we'll just simulate a successful send
  return true
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get the request body
    const { userId, subject, content, recipientEmail } = await req.json()
    
    if (!userId || !subject || !content) {
      return new Response(JSON.stringify({ error: 'UserId, subject, and content are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get the user's email if not provided
    let email = recipientEmail
    if (!email) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()
      
      if (error || !data || !data.email) {
        return new Response(JSON.stringify({ error: 'User email not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      email = data.email
    }

    // Record the email notification in the database
    const { data: notification, error: insertError } = await supabase
      .from('email_notifications')
      .insert({ 
        user_id: userId, 
        subject, 
        content, 
        status: 'sending' 
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error recording email notification:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to record email notification' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Send the email
    const success = await sendEmailNotification(email, subject, content)
    
    // Update the notification status based on the result
    const status = success ? 'sent' : 'failed'
    const { error: updateError } = await supabase
      .from('email_notifications')
      .update({ 
        status, 
        sent_at: success ? new Date().toISOString() : null 
      })
      .eq('id', notification.id)
    
    if (updateError) {
      console.error('Error updating notification status:', updateError)
    }

    // Return the result
    return new Response(JSON.stringify({ success, notificationId: notification.id }), {
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
