import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt = '';
    
    if (type === 'all') {
      systemPrompt = `You are a marketing content generator. Generate all marketing assets in JSON format based on the user's product/service description.

Return a valid JSON object with these exact fields:
{
  "instagram_caption": "Engaging Instagram caption with emojis and 3-5 relevant hashtags",
  "email_subject": "Compelling email subject line (under 60 characters)",
  "email_body": "Professional email body (3-4 paragraphs, HTML-friendly)",
  "landing_headline": "Powerful headline for landing page (under 80 characters)",
  "landing_cta": "Clear call-to-action button text (2-4 words)",
  "linkedin_post": "Professional LinkedIn post (2-3 paragraphs with line breaks)"
}`;
    } else if (type === 'instagram') {
      systemPrompt = 'Generate an engaging Instagram caption with emojis and 3-5 relevant hashtags. Return only the caption text.';
    } else if (type === 'email') {
      systemPrompt = 'Generate a compelling email with subject line and body. Return JSON: {"subject": "...", "body": "..."}';
    } else if (type === 'landing') {
      systemPrompt = 'Generate landing page content. Return JSON: {"headline": "...", "cta": "..."}';
    } else if (type === 'linkedin') {
      systemPrompt = 'Generate a professional LinkedIn post (2-3 paragraphs). Return only the post text.';
    }

    console.log('Calling AI Gateway with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('Generated content:', content);

    // For 'all' type, parse JSON response
    if (type === 'all') {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ content: parsedContent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }
    
    // For email and landing types, parse JSON
    if (type === 'email' || type === 'landing') {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ content: parsedContent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (e) {
        console.error('Failed to parse JSON:', e);
      }
    }

    // For other types, return as plain text
    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-content:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});