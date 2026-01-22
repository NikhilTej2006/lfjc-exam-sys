// Cloudflare Pages Function - same as your worker.js
export async function onRequest(context) {
  const { request } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      message: 'Please use POST method with JSON data'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Parse request body
    const { numbers } = await request.json();
    
    if (!numbers) {
      return new Response(JSON.stringify({
        error: 'Missing numbers',
        message: 'Please provide numbers in the request body'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Convert string to array of numbers
    const numArray = numbers.split(',').map(num => parseFloat(num.trim()));
    
    // Validate numbers
    const validNumbers = numArray.filter(num => !isNaN(num));
    
    if (validNumbers.length === 0) {
      return new Response(JSON.stringify({
        error: 'Invalid numbers',
        message: 'No valid numbers found in the input'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Calculate average
    const sum = validNumbers.reduce((a, b) => a + b, 0);
    const average = sum / validNumbers.length;
    
    // Prepare response
    const response = {
      average: average.toFixed(2),
      count: validNumbers.length,
      sum: sum.toFixed(2),
      numbers: validNumbers,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      error: 'Server error',
      message: 'An error occurred while processing your request'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
