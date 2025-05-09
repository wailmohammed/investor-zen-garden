
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

// Simple mock AI function (replace with actual AI API call in production)
const generateAIResponse = async (message: string): Promise<string> => {
  // This is a simple mock response - in a real app you'd call an AI API like OpenAI
  console.log('Received message:', message)
  
  // Simple finance-related response logic
  if (message.toLowerCase().includes('dividend')) {
    return 'Dividends are payments made by corporations to their shareholders. They represent a portion of the company\'s profits distributed to investors.'
  }
  
  if (message.toLowerCase().includes('stock') || message.toLowerCase().includes('invest')) {
    return 'Investing in stocks involves buying shares of publicly traded companies. It\'s important to research companies thoroughly and consider diversification to manage risk.'
  }
  
  return 'As your finance assistant, I can help answer questions about investments, dividends, retirement planning, and other financial topics. What would you like to know?'
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
    const { message, userId } = await req.json()
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate AI response
    const response = await generateAIResponse(message)
    
    // Store the conversation in the database if userId is provided
    if (userId) {
      const { error } = await supabase
        .from('chat_history')
        .insert({ user_id: userId, message, response })
      
      if (error) {
        console.error('Error saving chat history:', error)
      }
    }

    // Return the AI response
    return new Response(JSON.stringify({ response }), {
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
