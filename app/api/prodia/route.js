export async function POST(request) {
    const { prompt, model, apiKey, style_preset } = await request.json();
  
    try {
      // Generate the image
      const generateResponse = await fetch('https://api.prodia.com/v1/sd/generate', {
        method: 'POST',
        headers: {
          'X-Prodia-Key': apiKey,
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          steps: 30,
          style_preset: style_preset,
          cfg_scale: 7,
          sampler: 'DPM++ 2M Karras',
          width: 1024,
          height: 1024,
          negative_prompt: 'blurry, bad quality, distorted'
        })
      });
  
      const generateData = await generateResponse.json();
      
      if (!generateData.job) {
        return Response.json({ error: 'No job ID received from Prodia' }, { status: 400 });
      }
  
      // Poll for the job status until complete
      const jobId = generateData.job;
      let imageUrl = null;
      let attempts = 0;
      const maxAttempts = 30;
  
      while (attempts < maxAttempts) {
        const statusResponse = await fetch(`https://api.prodia.com/v1/job/${jobId}`, {
          headers: {
            'X-Prodia-Key': apiKey,
            'accept': 'application/json'
          }
        });
  
        const statusData = await statusResponse.json();
  
        if (statusData.status === 'succeeded') {
          imageUrl = statusData.imageUrl;
          break;
        } else if (statusData.status === 'failed') {
          return Response.json({ error: 'Image generation failed' }, { status: 400 });
        }
  
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
  
      if (!imageUrl) {
        return Response.json({ error: 'Image generation timed out' }, { status: 408 });
      }
  
      return Response.json({ imageUrl });
    } catch (error) {
      console.error('Prodia API Error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  