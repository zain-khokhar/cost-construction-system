import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import {
  parseQuery,
  getPhaseSpending,
  getItemPurchases,
  compareProjects,
  getProjectSummary,
  getVendorSpending,
  getCurrentMonthPurchases
} from '@/lib/aiService';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to handle rate limiting and retries
async function generateWithRetry(model, prompt, maxRetries = 1) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`AI generation attempt ${i + 1} failed:`, error.message);
      
      // Check for quota exhaustion (limit: 0 means quota is used up)
      if (error.message.includes('limit: 0') || error.message.includes('quota')) {
        throw new Error('QUOTA_EXHAUSTED');
      }
      
      // If it's a rate limit error and not the last retry
      if (error.message.includes('Too Many Requests') && i < maxRetries - 1) {
        console.log('Rate limit hit, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced wait time
        continue;
      }
      
      // If all retries failed or non-rate-limit error, throw the error
      if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
}

/**
 * AI Chatbot API endpoint
 * Processes natural language queries using Google Gemini AI
 */
async function handler(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const body = await request.json();
  const { message } = body;
  
  if (!message || typeof message !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'Message is required' },
      { status: 400 }
    );
  }
  
  const companyId = user.companyId;
  
  // Parse the query to understand intent
  const parsed = parseQuery(message);
  
  console.log('Chat Query:', { message, parsed, companyId });
  
  let response = '';
  let data = null;
  
  try {
    // Get relevant data based on intent
    switch (parsed.intent) {
      case 'phase_spending': {
        const phaseData = await getPhaseSpending(companyId, parsed.phase);
        data = phaseData;
        
        if (!phaseData) {
          // Get available phases to show user
          const Phase = (await import('@/models/Phase')).default;
          const availablePhases = await Phase.find({ companyId }).select('name').limit(5);
          const phasesList = availablePhases.map(p => p.name).join(', ');
          
          // Use Gemini to generate a helpful response
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const prompt = `User asked: "${message}" trying to find phase "${parsed.phase}"

We couldn't find that phase. ${availablePhases.length > 0 ? `Available phases are: ${phasesList}` : 'No phases found in the system.'}

Generate a friendly, helpful response that:
1. Confirms we couldn't find "${parsed.phase}"
2. ${availablePhases.length > 0 ? `Lists the available phases` : 'Suggests creating phases first'}
3. Suggests they try one of the available options

Keep it under 60 words and conversational. Use bullet points for phase names.`;
          const result = await model.generateContent(prompt);
          response = result.response.text();
        } else {
          // Use Gemini to generate a natural response with the data
          const utilization = ((phaseData.spent / phaseData.budget) * 100).toFixed(1);
          const status = utilization > 90 ? 'high' : utilization > 70 ? 'moderate' : 'good';
          
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const prompt = `You're analyzing construction phase spending. Generate a clear, professional response:

Phase: ${phaseData.phaseName}
Budget: $${phaseData.budget.toLocaleString()}
Spent: $${phaseData.spent.toLocaleString()}
Remaining: $${phaseData.remaining.toLocaleString()}
Total Purchases: ${phaseData.purchaseCount}
Budget Utilization: ${utilization}% (${status})

Format requirements:
- Start with phase name in bold
- Show key numbers with $ signs formatted with commas
- Add emoji indicator: 🟢 (good <70%), 🟡 (moderate 70-90%), 🔴 (high >90%)
- Include brief insight about spending status
- Use markdown bold for numbers
- Keep under 80 words`;
          
          const result = await model.generateContent(prompt);
          response = result.response.text();
        }
        break;
      }
      
      case 'item_purchases': {
        const purchases = parsed.currentMonth
          ? await getCurrentMonthPurchases(companyId, parsed.item)
          : await getItemPurchases(companyId, parsed.item || '');
        
        data = { purchases, total: purchases.reduce((sum, p) => sum + p.totalCost, 0) };
        
        if (purchases.length === 0) {
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const prompt = `User asked: "${message}"

No purchases found for "${parsed.item || 'items'}"${parsed.currentMonth ? ' this month' : ''}.

Generate a helpful response:
1. Confirm no records found
2. Suggest checking item name or time period
3. Offer to show all recent purchases

Keep conversational and under 40 words.`;
          const result = await model.generateContent(prompt);
          response = result.response.text();
        } else {
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const topPurchases = purchases.slice(0, 5);
          const purchasesList = topPurchases.map(p => 
            `• ${p.item}: ${p.quantity} ${p.unit} × $${p.pricePerUnit.toLocaleString()} = $${p.totalCost.toLocaleString()} - ${p.vendor} (${p.project})`
          ).join('\n');
          
          const prompt = `Analyze these construction purchase records:

Item: ${parsed.item || 'Various items'}
Time Period: ${parsed.currentMonth ? 'This month' : 'All time'}
Total Purchases: ${purchases.length}
Total Cost: $${data.total.toLocaleString()}
Average Cost: $${(data.total / purchases.length).toLocaleString()}

Top Purchases:
${purchasesList}
${purchases.length > 5 ? `\n...and ${purchases.length - 5} more purchases` : ''}

Format requirements:
- Start with summary line with total count and cost
- List top 3-5 purchases with bullet points
- Use markdown bold for totals and item names
- Add brief insight (e.g., top vendor, average cost trend)
- Include emoji 📦 for items
- Keep under 120 words`;
          
          const result = await model.generateContent(prompt);
          response = result.response.text();
        }
        break;
      }
      
      case 'compare_projects': {
        if (parsed.projects.length < 2) {
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const prompt = `User asked: "${message}". They need to specify two projects. Generate a helpful example. Under 40 words.`;
          const result = await model.generateContent(prompt);
          response = result.response.text();
        } else {
          const comparison = await compareProjects(companyId, parsed.projects[0], parsed.projects[1]);
          data = comparison;
          
          if (!comparison) {
            const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
            const prompt = `User asked to compare "${parsed.projects[0]}" and "${parsed.projects[1]}" but projects not found. Generate helpful response. Under 40 words.`;
            const result = await model.generateContent(prompt);
            response = result.response.text();
          } else {
            const p1 = comparison.project1;
            const p2 = comparison.project2;
            
            const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
            const prompt = `Generate a detailed comparison analysis for these two construction projects:

Project 1: ${p1.name}
- Budget: $${p1.budget.toLocaleString()}
- Spent: $${p1.spent.toLocaleString()} (${p1.percentUsed}%)
- Remaining: $${p1.remaining.toLocaleString()}
- Phases: ${p1.phaseCount}, Purchases: ${p1.purchaseCount}
- Status: ${p1.status}

Project 2: ${p2.name}
- Budget: $${p2.budget.toLocaleString()}
- Spent: $${p2.spent.toLocaleString()} (${p2.percentUsed}%)
- Remaining: $${p2.remaining.toLocaleString()}
- Phases: ${p2.phaseCount}, Purchases: ${p2.purchaseCount}
- Status: ${p2.status}

Key Differences:
- Budget difference: $${Math.abs(comparison.comparison.budgetDifference).toLocaleString()} (${comparison.comparison.budgetDifference > 0 ? p1.name : p2.name} has more)
- Spending difference: $${Math.abs(comparison.comparison.spentDifference).toLocaleString()} (${comparison.comparison.spentDifference > 0 ? p1.name : p2.name} spent more)
- Efficiency: ${Math.abs(comparison.comparison.efficiencyDifference).toFixed(1)}% difference (${comparison.comparison.efficiencyDifference > 0 ? p2.name : p1.name} more efficient)

Format with markdown headers, bullet points, bold numbers. Include insights. Under 200 words.`;
            
            const result = await model.generateContent(prompt);
            response = result.response.text();
          }
        }
        break;
      }
      
      case 'vendor_spending': {
        const vendors = await getVendorSpending(companyId, parsed.vendor);
        data = vendors;
        
        if (vendors.length === 0) {
          response = "No vendor spending data found in your system. Try adding some purchases with vendors first, then ask me again!";
        } else {
          // Try AI first, but fall back to formatted data if AI is unavailable
          try {
            const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
            const vendorsList = vendors.slice(0, 5).map((v, i) => 
              `${i + 1}. ${v.name}: $${v.totalSpent.toLocaleString()} (${v.purchaseCount} purchases) - Items: ${[...new Set(v.items)].slice(0, 3).join(', ')}`
            ).join('\n');
            
            const prompt = `Generate a vendor spending analysis for:

${vendorsList}
${vendors.length > 5 ? `...and ${vendors.length - 5} more vendors` : ''}

Format with markdown, numbered list, bold for vendor names and amounts. Under 150 words.`;
            
            response = await generateWithRetry(model, prompt);
            
            // If AI returned the fallback message, provide formatted data instead
            if (response.includes("high demand") || response.includes("try your request again")) {
              throw new Error("AI unavailable, using fallback");
            }
          } catch (aiError) {
            // Fallback: Return formatted vendor data without AI
            response = `## 📊 Vendor Spending Analysis\n\n`;
            vendors.slice(0, 10).forEach((vendor, i) => {
              response += `**${i + 1}. ${vendor.name}**\n`;
              response += `- Total Spent: **$${vendor.totalSpent.toLocaleString()}**\n`;
              response += `- Purchases: ${vendor.purchaseCount}\n`;
              response += `- Top Items: ${[...new Set(vendor.items)].slice(0, 3).join(', ')}\n\n`;
            });
            
            if (vendors.length > 10) {
              response += `*...and ${vendors.length - 10} more vendors*\n\n`;
            }
            
            const totalSpent = vendors.reduce((sum, v) => sum + v.totalSpent, 0);
            response += `**Total Vendor Spending: $${totalSpent.toLocaleString()}**`;
          }
        }
        break;
      }
      
      case 'project_summary': {
        const summary = await getProjectSummary(companyId, parsed.project);
        data = summary;
        
        console.log('Project Summary Result:', { projectName: parsed.project, found: !!summary, isArray: Array.isArray(summary) });
        
        if (!summary) {
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const prompt = `User asked: "${message}" but no projects found in the system. 

Generate a helpful response that:
1. Confirms no projects found
2. Suggests creating a project first
3. Keeps it friendly and under 40 words`;
          const result = await model.generateContent(prompt);
          response = result.response.text();
        } else if (Array.isArray(summary)) {
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const projectsList = summary.map((p, i) => 
            `${i + 1}. ${p.name}: Budget $${p.budget.toLocaleString()}, Spent $${p.spent.toLocaleString()} (${p.percentUsed}%), ${p.phaseCount} phases, Status: ${p.status}`
          ).join('\n');
          
          const prompt = `Generate a comprehensive summary for all construction projects:

${projectsList}

Format requirements:
- Start with total count: "Found X projects"
- Use numbered list with bold project names
- Show key metrics for each
- Add emoji status indicators (🟢 good, 🟡 moderate, 🔴 high)
- Include brief overall insight
- Keep under 200 words`;
          
          const result = await model.generateContent(prompt);
          response = result.response.text();
        } else {
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
          const utilization = parseFloat(summary.percentUsed);
          const status = utilization > 90 ? '🔴 High' : utilization > 70 ? '🟡 Moderate' : '🟢 Good';
          
          const prompt = `Generate a detailed project summary for:

Project: ${summary.name}
Budget: $${summary.budget.toLocaleString()}
Spent: $${summary.spent.toLocaleString()} (${summary.percentUsed}%)
Remaining: $${summary.remaining.toLocaleString()}
Phases: ${summary.phaseCount}
Status: ${summary.status}
Budget Health: ${status}

Format requirements:
- Start with bold project name
- Show key metrics with bold numbers
- Add status emoji
- Include actionable insight
- Keep under 100 words`;
          
          const result = await model.generateContent(prompt);
          response = result.response.text();
        }
        break;
      }
      
      default: {
        // Use Gemini AI for general queries and help
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
        const prompt = `You are an AI assistant for a construction cost management system. The user asked: "${message}"

Available features:
- Phase spending queries
- Item purchase tracking
- Project comparisons
- Vendor spending analysis
- Project summaries

Generate a helpful, friendly response explaining what you can help with. Include 2-3 example questions they can ask. Under 100 words. Use markdown formatting.`;
        
        const result = await model.generateContent(prompt);
        response = result.response.text();
      }
    }
    
    return {
      message: response,
      data,
      intent: parsed.intent,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('AI Chat Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: message,
      parsed
    });
    
    // Return a user-friendly error with the AI
    try {
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp' });
      const prompt = `The user asked: "${message}" but we encountered a technical error. 

Generate a friendly apology and suggest:
1. Try rephrasing the question
2. Check if the data exists
3. Use simpler terms

Keep it under 50 words and helpful.`;
      
      const aiResponse = await generateWithRetry(model, prompt);
      
      return {
        message: aiResponse,
        data: null,
        intent: 'error',
        timestamp: new Date().toISOString()
      };
    } catch (aiError) {
      console.error('AI Error handling failed:', aiError);
      return NextResponse.json(
        { ok: false, error: 'Failed to process your query. Please try again.' },
        { status: 500 }
      );
    }
  }
}

export const POST = apiHandler(handler);
