# AI Chatbot with Google Gemini Flash 2.0

## Overview
The AI chatbot uses **Google Gemini 2.0 Flash** to provide intelligent, conversational responses to construction cost queries.

## Setup

### 1. API Key Configuration
Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=AIzaSyCeNTPJyOzYerE2JlaXKTL0wTRBMdkBE9c
GEMINI_MODEL=gemini-2.0-flash-exp
```

**Get API Key**: https://makersuite.google.com/app/apikey

### 2. Dependencies
```bash
npm install @google/generative-ai
```

## Features

### Natural Language Processing
The chatbot understands various query types:

1. **Phase Spending**
   - "What's the total spent on Phase 1?"
   - "How much budget is left for Foundation phase?"
   - "Show me Phase 2 costs"

2. **Item Purchases**
   - "Show me cement purchases this month"
   - "List all steel purchases"
   - "What did we buy from vendor ABC?"

3. **Project Comparison**
   - "Compare Project A to Project B"
   - "How does Villa project compare to Mall project?"
   - "Show differences between two projects"

4. **Vendor Analysis**
   - "Show me vendor spending"
   - "Which vendor did we spend most on?"
   - "List all purchases from XYZ vendor"

5. **Project Summary**
   - "Give me project summary"
   - "What's the status of Project A?"
   - "Show all projects overview"

## How It Works

### 1. Query Parsing (`lib/aiService.js`)
Rule-based parser identifies query intent:
```javascript
parseQuery("What's spent on Phase 1?")
// Returns: { intent: 'phase_spending', phase: '1' }
```

### 2. Data Fetching (`lib/aiService.js`)
Retrieves relevant data from MongoDB:
```javascript
getPhaseSpending(companyId, "Phase 1")
// Returns: { phaseName, budget, spent, remaining, ... }
```

### 3. AI Response Generation (`app/api/ai/chat/route.js`)
Gemini AI generates natural language response:
```javascript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.0-flash-exp' 
});

const prompt = `Generate response for phase spending: ...`;
const result = await model.generateContent(prompt);
```

### 4. UI Display (`components/ChatBot.js`)
React component displays conversation:
- Message bubbles (user vs bot)
- Markdown rendering
- Auto-scroll
- Loading states

## Architecture

```
User Query
    ↓
ChatBot Component (Frontend)
    ↓
POST /api/ai/chat
    ↓
Parse Intent (aiService.parseQuery)
    ↓
Fetch Data (aiService functions)
    ↓
Gemini AI (Generate Response)
    ↓
Return formatted response
    ↓
Display in Chat UI
```

## API Endpoint

**POST** `/api/ai/chat`

### Request
```json
{
  "message": "What's the total spent on Phase 1?"
}
```

### Response
```json
{
  "ok": true,
  "data": {
    "message": "**Foundation Phase** has spent **$45,230** out of **$50,000** budget...",
    "data": {
      "phaseName": "Foundation",
      "budget": 50000,
      "spent": 45230,
      "remaining": 4770,
      "purchaseCount": 23
    },
    "intent": "phase_spending",
    "timestamp": "2025-11-04T..."
  }
}
```

## Prompt Engineering

Each query type has optimized prompts:

### Phase Spending Prompt
```
Generate a friendly, conversational response for this construction cost data:

Phase: Foundation
Budget: $50,000
Spent: $45,230
Remaining: $4,770
Purchases: 23
Utilization: 90.5%

Format with markdown, use bold for numbers, and keep it under 100 words.
```

### Benefits of Prompts
- **Consistency**: Markdown formatting
- **Brevity**: Under 100-200 words
- **Clarity**: Bold numbers, bullet points
- **Context**: Construction-specific language

## Performance

### Response Times
- Query parsing: <10ms
- Database fetch: 50-200ms
- Gemini AI: 500-1500ms
- **Total**: ~1-2 seconds

### Optimization
- Use `gemini-2.0-flash-exp` (fastest model)
- Limit prompt length
- Cache common queries (future enhancement)

## Security

### Multi-Tenant Isolation
All queries filter by `companyId`:
```javascript
const user = await getUserFromRequest(request);
const companyId = user.companyId;

// All DB queries include companyId
await Phase.find({ companyId, ... });
```

### Authentication
- Requires valid JWT token
- User must be logged in
- Company-specific data only

## Customization

### Change AI Model
Update `.env.local`:
```env
# Options: gemini-2.0-flash-exp, gemini-pro, gemini-1.5-flash
GEMINI_MODEL=gemini-pro
```

### Adjust Response Length
Modify prompts in `app/api/ai/chat/route.js`:
```javascript
const prompt = `... keep it under 50 words.`; // Change limit
```

### Add New Query Types
1. Update `parseQuery()` in `lib/aiService.js`
2. Create data fetching function
3. Add case in chat route handler

## Testing

### Example Queries
```javascript
// Phase spending
"What's the total spent on Phase 1?"
"Show me Foundation phase costs"

// Item purchases
"Show me cement purchases this month"
"List all steel items bought"

// Comparisons
"Compare Villa to Mall project"
"How do projects differ?"

// Vendor analysis
"Show vendor spending"
"Which vendor costs most?"

// Project summary
"Give me all projects summary"
"What's Project A status?"
```

## Troubleshooting

### API Key Issues
```
Error: API key not valid
```
**Fix**: Check `.env.local` has correct `GEMINI_API_KEY`

### Model Not Found
```
Error: Model not found
```
**Fix**: Use valid model name: `gemini-2.0-flash-exp`

### Slow Responses
- Gemini Flash is optimized for speed
- Check internet connection
- Consider caching responses

## Future Enhancements

1. **Context Awareness**: Remember previous messages
2. **Response Caching**: Cache common queries
3. **Voice Input**: Add speech-to-text
4. **Charts in Chat**: Generate visual responses
5. **Smart Suggestions**: Predict next question
6. **Multi-language**: Support other languages

## Cost Considerations

### Gemini API Pricing (as of 2025)
- **Free Tier**: 60 requests/minute
- **Paid**: ~$0.001 per request
- **Estimate**: 1000 queries = ~$1

### Cost Saving Tips
- Use Flash model (cheapest)
- Limit response length
- Cache frequent queries
- Rate limit per user

## Comparison: Gemini vs OpenAI

| Feature | Gemini Flash 2.0 | GPT-3.5 Turbo |
|---------|------------------|---------------|
| Speed | ~500ms | ~800ms |
| Cost | ~$0.001/req | ~$0.002/req |
| Quality | Excellent | Excellent |
| Free Tier | 60/min | None |
| Best For | Fast queries | Complex reasoning |

**Verdict**: Gemini Flash 2.0 is perfect for this use case!

## Resources

- **Gemini Docs**: https://ai.google.dev/docs
- **API Keys**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Models**: https://ai.google.dev/models/gemini

## Support

For issues or questions:
1. Check `.env.local` configuration
2. Verify API key is active
3. Review console logs
4. Test with simple queries first
