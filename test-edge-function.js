// Test script to call the Edge Function directly
// Run with: node test-edge-function.js

const SUPABASE_URL = 'https://vogxtprdcnmlzvuxmbss.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE'

async function testEdgeFunction() {
  console.log('Testing Edge Function...\n')
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        // No Authorization header - let's see what happens
      },
      body: JSON.stringify({
        presentationId: 'test-123',
        pdfPath: 'temp/test/test.pdf'
      })
    })
    
    console.log('Response status:', response.status)
    console.log('Response statusText:', response.statusText)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log('\nResponse body (raw):', text)
    
    try {
      const json = JSON.parse(text)
      console.log('\nResponse body (parsed):', JSON.stringify(json, null, 2))
    } catch (e) {
      console.log('Could not parse as JSON')
    }
    
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

testEdgeFunction()
