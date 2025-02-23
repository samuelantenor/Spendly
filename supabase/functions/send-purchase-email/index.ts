import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to generate AI encouragement message
async function generateEncouragement(emotionalTrigger: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a mindful spending coach who helps people develop healthier relationships with shopping and money."
          },
          {
            role: "user",
            content: `Write a short, empathetic, and encouraging message (2-3 sentences) for someone who made a purchase while feeling ${emotionalTrigger}. Focus on mindful spending and emotional well-being. Be supportive but also gently encourage thoughtful purchasing decisions.`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const jsonResponse = await response.json();
    return jsonResponse.choices?.[0]?.message?.content || 
      "Remember that mindful spending leads to better financial and emotional well-being. Take a moment to reflect on your purchases and how they align with your goals.";
  } catch (error) {
    console.error('Error generating AI encouragement:', error);
    // Return a default message if AI generation fails
    return "Thank you for practicing mindful spending. Each purchase is an opportunity to reflect on our choices and grow.";
  }
}

// Initialize Resend with error handling
const initResend = () => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  
  console.log('Resend API key found:', apiKey.substring(0, 5) + '...');
  
  try {
    const resend = new Resend(apiKey);
    return resend;
  } catch (error) {
    console.error('Error initializing Resend:', error);
    throw error;
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting email send process...');

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    console.log('Verifying user authentication...');

    // Verify authentication using service role client
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication token');
    }

    console.log('User authenticated:', user.email);

    // Initialize Resend
    let resend;
    try {
      resend = initResend();
      console.log('Resend client initialized successfully');
    } catch (error) {
      console.error('Resend initialization error:', error);
      throw new Error('Email service configuration error');
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed:', body);
    } catch (error) {
      throw new Error('Invalid request body');
    }

    const { orderNumber, items, totalAmount, emotionalTrigger } = body;

    // Validate required fields
    if (!orderNumber || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Invalid request: Missing required fields');
    }

    // Generate AI encouragement based on emotional trigger
    const encouragementMessage = await generateEncouragement(emotionalTrigger);

    // Create email HTML
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5; text-align: center;">Order Confirmation</h1>
        <p style="color: #374151;">Dear ${user.email},</p>
        <p style="color: #374151;">Thank you for your purchase! Here's a summary of your order:</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #374151; font-weight: bold;">Order #${orderNumber}</p>
          
          <div style="margin: 20px 0;">
            ${items.map((item: any) => `
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />
                <div style="margin-left: 10px;">
                  <p style="color: #374151; margin: 0;">${item.name}</p>
                  <p style="color: #6B7280; margin: 0;">Quantity: ${item.quantity}</p>
                  <p style="color: #4F46E5; margin: 0;">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="border-top: 1px solid #D1D5DB; padding-top: 10px;">
            <p style="color: #374151; font-weight: bold; text-align: right;">
              Total: $${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #4F46E5; margin-top: 0;">A Note from Your Mindful Shopping Coach</h3>
          <p style="color: #4338CA; font-style: italic;">${encouragementMessage}</p>
        </div>

        <p style="color: #6B7280; text-align: center; margin-top: 40px;">
          This is a simulated purchase. No actual payment was processed.
        </p>
      </div>
    `;

    console.log('Attempting to send email to:', user.email);

    // Send email with error handling
    try {
      const emailResult = await resend.emails.send({
        from: 'Spendly <orders@tnormarketing.com>',
        to: [user.email],
        subject: `Order Confirmation #${orderNumber}`,
        html: emailHtml
      });

      console.log('Email sent successfully:', emailResult);

      return new Response(
        JSON.stringify({ success: true, emailResult }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      throw emailError;
    }
  } catch (err) {
    console.error('Error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('auth') ? 401 : 400;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: statusCode,
        details: err instanceof Error ? err.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});