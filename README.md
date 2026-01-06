Vercel Deployment Guide

1) You need to connect your github or create your vercel account
2) then click on new project
3) choose the github repository
4) then in the build setting > install command make this changes > npm install --force 
5) add this env keys 

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGl2ZS10aXRtb3VzZS0zLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_jr78ue5Kfb7euPvGG8irlebZW8bgstq6hgXPCbT6Er



NEXT_PUBLIC_GROQ_API_KEY=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

NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDkcqrUcnYyAHa95rJb9NY-ePXpcL7wf90

NEXT_PUBLIC_DEEPGRAM_API_KEY=e94b27c95854e303c17c7c9dc0ba2bb735998ff1

NEXT_PUBLIC_TOGETHER_API_KEY=dfb76af84e531818294f18274c3b122744972c02e8445ed0aceb27f07d389347 


NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=https://bbikcxalypttfgrlxstf.supabase.co
NEXT_PUBLIC_SUPABASE_PRIVATE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTg3MDgsImV4cCI6MjA2OTI5NDcwOH0.i_EWfYC74cftJ1OQ_ipAkpaGt1xc0CXEmd-VKiLgN9g


NEXT_PUBLIC_VAPI_PRIVATE_KEY=ca31a591-76eb-4716-bf41-2f616a99a87b
NEXT_PUBLIC_BASE_URL=http://localhost:3000 
NEXT_PUBLIC_VAPI_PUBLIC_KEY=b2f456f6-29d3-40d3-8b96-f9142dc205e2

remember base url will be your vercel deployed url you can update this env variable after deployment as well 
