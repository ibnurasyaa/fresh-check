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
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Analyzing food image with Gemini Vision...');

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analisa foto makanan ini dan tentukan apakah makanan ini layak untuk dimakan atau tidak. Berikan respons dalam format JSON dengan struktur: { \"isSafe\": boolean, \"confidence\": string (low/medium/high), \"reasoning\": string (penjelasan detail dalam Bahasa Indonesia), \"recommendations\": string (rekomendasi dalam Bahasa Indonesia) }. Pertimbangkan faktor seperti kesegaran, tanda-tanda pembusukan, kontaminasi, dan keamanan pangan secara umum."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from markdown code blocks if present
    let jsonText = textResponse;
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Try to find JSON object in the text
      const jsonObjMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonObjMatch) {
        jsonText = jsonObjMatch[0];
      }
    }

    const analysis = JSON.parse(jsonText);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isSafe: false,
        confidence: 'low',
        reasoning: 'Terjadi kesalahan saat menganalisa gambar. Silakan coba lagi.',
        recommendations: 'Pastikan foto jelas dan coba lagi.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});