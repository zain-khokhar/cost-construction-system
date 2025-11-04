import { NextResponse } from 'next/server';
import { apiHandler } from '@/lib/apiHandler';
import { getUserFromRequest } from '@/lib/auth';
import Project from '@/models/Project';
import Phase from '@/models/Phase';
import Vendor from '@/models/Vendor';
import Purchase from '@/models/Purchase';

/**
 * Get smart prompt suggestions based on actual database data
 */
async function handler(request) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const companyId = user.companyId;
  
  try {
    // Get actual data counts and examples
    const projects = await Project.find({ companyId }).limit(3).select('name');
    const phases = await Phase.find({ companyId }).limit(3).select('name');
    const vendors = await Vendor.find({ companyId }).limit(3).select('name');
    
    // Get recent purchases to find common items
    const recentPurchases = await Purchase.find({ companyId })
      .populate('itemId', 'name')
      .limit(10)
      .sort({ purchaseDate: -1 });
    
    const items = [...new Set(
      recentPurchases
        .filter(p => p.itemId?.name)
        .map(p => p.itemId.name)
    )].slice(0, 3);
    
    // Build smart suggestions
    const suggestions = [];
    
    // Phase spending suggestions
    if (phases.length > 0) {
      suggestions.push({
        category: 'Phase Spending',
        icon: '📊',
        prompts: phases.map(phase => ({
          text: `What's the total spent on ${phase.name}?`,
          query: `What's the total spent on ${phase.name}?`
        }))
      });
    }
    
    // Item purchase suggestions
    if (items.length > 0) {
      suggestions.push({
        category: 'Item Purchases',
        icon: '📦',
        prompts: items.map(item => ({
          text: `Show me ${item} purchases this month`,
          query: `Show me ${item} purchases this month`
        }))
      });
    }
    
    // Project comparison suggestions
    if (projects.length >= 2) {
      suggestions.push({
        category: 'Project Comparison',
        icon: '⚖️',
        prompts: [
          {
            text: `Compare ${projects[0].name} to ${projects[1].name}`,
            query: `Compare ${projects[0].name} to ${projects[1].name}`
          }
        ]
      });
    }
    
    // Vendor analysis suggestions
    if (vendors.length > 0) {
      suggestions.push({
        category: 'Vendor Analysis',
        icon: '🏢',
        prompts: [
          {
            text: 'Show me top vendor spending',
            query: 'Show me vendor spending'
          },
          ...vendors.slice(0, 2).map(vendor => ({
            text: `How much did we spend with ${vendor.name}?`,
            query: `Show me vendor ${vendor.name} spending`
          }))
        ]
      });
    }
    
    // Project summary suggestions
    if (projects.length > 0) {
      suggestions.push({
        category: 'Project Overview',
        icon: '📋',
        prompts: [
          {
            text: 'Give me all projects summary',
            query: 'Give me all projects summary'
          },
          ...projects.slice(0, 2).map(project => ({
            text: `What's the status of ${project.name}?`,
            query: `Give me ${project.name} project summary`
          }))
        ]
      });
    }
    
    return {
      suggestions,
      stats: {
        projectCount: projects.length,
        phaseCount: phases.length,
        vendorCount: vendors.length,
        itemCount: items.length
      }
    };
    
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

export const GET = apiHandler(handler);
