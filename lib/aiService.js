/**
 * AI Service - Handles AI chatbot interactions and data queries
 * Uses OpenAI API to process natural language queries and fetch relevant data
 */

import Purchase from '@/models/Purchase';
import Phase from '@/models/Phase';
import Category from '@/models/Category';
import Item from '@/models/Item';
import Project from '@/models/Project';
import Vendor from '@/models/Vendor';

/**
 * Query project spending by phase
 */
export async function getPhaseSpending(companyId, phaseName, projectId = null) {
  const query = { companyId };
  
  if (projectId) {
    query.projectId = projectId;
  }
  
  if (phaseName) {
    // Try exact match first, then partial match (case insensitive)
    let phase = await Phase.findOne({ 
      companyId, 
      name: { $regex: new RegExp(`^${phaseName}$`, 'i') } 
    });
    
    // If no exact match, try partial match
    if (!phase) {
      phase = await Phase.findOne({ 
        companyId, 
        name: { $regex: new RegExp(phaseName, 'i') } 
      });
    }
    
    if (!phase) {
      return null;
    }
    
    const purchases = await Purchase.find({ 
      companyId, 
      phaseId: phase._id 
    });
    
    const totalSpent = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    
    return {
      phaseName: phase.name,
      budget: phase.budget || 0,
      spent: totalSpent,
      remaining: (phase.budget || 0) - totalSpent,
      purchaseCount: purchases.length
    };
  }
  
  return null;
}

/**
 * Query purchases by item name and date range
 */
export async function getItemPurchases(companyId, itemName, startDate = null, endDate = null) {
  const query = { companyId };
  
  if (startDate) {
    query.purchaseDate = { $gte: new Date(startDate) };
  }
  
  if (endDate) {
    if (query.purchaseDate) {
      query.purchaseDate.$lte = new Date(endDate);
    } else {
      query.purchaseDate = { $lte: new Date(endDate) };
    }
  }
  
  const purchases = await Purchase.find(query)
    .populate('itemId', 'name unit')
    .populate('vendorId', 'name')
    .populate('projectId', 'name')
    .sort({ purchaseDate: -1 });
  
  const filtered = purchases.filter(p => {
    if (!p.itemId) return false;
    const name = p.itemId.name || '';
    return name.toLowerCase().includes(itemName.toLowerCase());
  });
  
  return filtered.map(p => ({
    item: p.itemId?.name || 'Unknown',
    quantity: p.quantity,
    unit: p.itemId?.unit || '',
    pricePerUnit: p.pricePerUnit,
    totalCost: p.totalCost,
    vendor: p.vendorId?.name || 'Unknown',
    project: p.projectId?.name || 'Unknown',
    date: p.purchaseDate
  }));
}

/**
 * Compare two projects
 */
export async function compareProjects(companyId, project1Name, project2Name) {
  const project1 = await Project.findOne({ 
    companyId, 
    name: { $regex: new RegExp(project1Name, 'i') } 
  });
  
  const project2 = await Project.findOne({ 
    companyId, 
    name: { $regex: new RegExp(project2Name, 'i') } 
  });
  
  if (!project1 || !project2) {
    return null;
  }
  
  const getProjectStats = async (project) => {
    const purchases = await Purchase.find({ 
      companyId, 
      projectId: project._id 
    });
    
    const totalSpent = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const phases = await Phase.find({ companyId, projectId: project._id });
    
    return {
      name: project.name,
      budget: project.budget,
      spent: totalSpent,
      remaining: project.budget - totalSpent,
      percentUsed: ((totalSpent / project.budget) * 100).toFixed(1),
      phaseCount: phases.length,
      purchaseCount: purchases.length,
      status: project.status || 'ongoing'
    };
  };
  
  const stats1 = await getProjectStats(project1);
  const stats2 = await getProjectStats(project2);
  
  return {
    project1: stats1,
    project2: stats2,
    comparison: {
      budgetDifference: stats1.budget - stats2.budget,
      spentDifference: stats1.spent - stats2.spent,
      efficiencyDifference: parseFloat(stats1.percentUsed) - parseFloat(stats2.percentUsed)
    }
  };
}

/**
 * Get project summary
 */
export async function getProjectSummary(companyId, projectName = null) {
  const query = { companyId };
  
  if (projectName) {
    // Try exact match first, then partial match
    query.$or = [
      { name: { $regex: new RegExp(`^${projectName}$`, 'i') } },
      { name: { $regex: new RegExp(projectName, 'i') } }
    ];
  }
  
  const projects = await Project.find(query).limit(projectName ? 1 : 10);
  
  if (projects.length === 0) {
    return null;
  }
  
  const summaries = await Promise.all(projects.map(async (project) => {
    const purchases = await Purchase.find({ companyId, projectId: project._id });
    const totalSpent = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const phases = await Phase.find({ companyId, projectId: project._id });
    
    return {
      name: project.name || 'Unknown Project',
      budget: project.budget || 0,
      spent: totalSpent,
      remaining: (project.budget || 0) - totalSpent,
      percentUsed: project.budget ? ((totalSpent / project.budget) * 100).toFixed(1) : '0.0',
      phaseCount: phases.length,
      status: project.status || 'ongoing'
    };
  }));
  
  return projectName ? summaries[0] : summaries;
}

/**
 * Get vendor spending analysis
 */
export async function getVendorSpending(companyId, vendorName = null, projectId = null) {
  const query = { companyId };
  
  if (projectId) {
    query.projectId = projectId;
  }
  
  const purchases = await Purchase.find(query)
    .populate('vendorId', 'name')
    .populate('itemId', 'name');
  
  const vendorMap = {};
  
  purchases.forEach(p => {
    if (!p.vendorId) return;
    
    const name = p.vendorId.name;
    
    if (vendorName && !name.toLowerCase().includes(vendorName.toLowerCase())) {
      return;
    }
    
    if (!vendorMap[name]) {
      vendorMap[name] = {
        name,
        totalSpent: 0,
        purchaseCount: 0,
        items: []
      };
    }
    
    vendorMap[name].totalSpent += p.totalCost || 0;
    vendorMap[name].purchaseCount += 1;
    
    if (p.itemId) {
      vendorMap[name].items.push(p.itemId.name);
    }
  });
  
  return Object.values(vendorMap).sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Get current month purchases
 */
export async function getCurrentMonthPurchases(companyId, itemName = null) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getItemPurchases(companyId, itemName || '', startOfMonth, endOfMonth);
}

/**
 * Parse natural language query and determine intent
 */
export function parseQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Phase spending queries - improved detection
  if ((lowerQuery.includes('spent') || lowerQuery.includes('cost') || 
       lowerQuery.includes('budget') || lowerQuery.includes('total')) &&
      (lowerQuery.includes('phase') || lowerQuery.includes('on ') || 
       lowerQuery.includes('grey') || lowerQuery.includes('gray') ||
       lowerQuery.includes('foundation') || lowerQuery.includes('structure') || 
       lowerQuery.includes('finishing') || lowerQuery.includes('electrical') ||
       lowerQuery.includes('plumbing'))) {
    
    // Extract phase name more intelligently
    let phaseName = null;
    
    // Try various patterns to extract phase name
    const patterns = [
      // "What's spent on Grey" or "total spent on Foundation"
      /(?:spent|cost|budget|total)\s+on\s+([A-Za-z0-9\s]+?)(?:\?|$|phase)/i,
      // "Phase 1" or "Phase One"
      /phase\s+(\d+|one|two|three|four|five|1|2|3|4|5)/i,
      // Common phase names
      /(grey|gray|foundation|structure|electrical|plumbing|finishing|framing|roofing)/i,
      // Generic "on [name]"
      /on\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(?:\?|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        phaseName = match[1].trim();
        break;
      }
    }
    
    // If still no phase name, try to extract last word before punctuation
    if (!phaseName) {
      const lastWordMatch = query.match(/\s+([A-Za-z]+)\s*\??$/i);
      if (lastWordMatch) {
        phaseName = lastWordMatch[1];
      }
    }
    
    return {
      intent: 'phase_spending',
      phase: phaseName
    };
  }
  
  // Item purchase queries
  if ((lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('get')) && 
      (lowerQuery.includes('purchase') || lowerQuery.includes('buy') || lowerQuery.includes('bought'))) {
    
    // Extract item name
    const itemPatterns = [
      /(cement|concrete|steel|brick|paint|wire|pipe|lumber|sand|gravel|rebar|tile|glass|wood|metal)/i,
      /show\s+(?:me\s+)?([A-Za-z]+)\s+purchase/i
    ];
    
    let itemName = null;
    for (const pattern of itemPatterns) {
      const match = query.match(pattern);
      if (match) {
        itemName = match[1];
        break;
      }
    }
    
    const monthMatch = lowerQuery.includes('month') || lowerQuery.includes('this month');
    
    return {
      intent: 'item_purchases',
      item: itemName,
      currentMonth: monthMatch
    };
  }
  
  // Comparison queries
  if (lowerQuery.includes('compare')) {
    // Extract project names more intelligently
    const projects = [];
    
    // Try different patterns
    const patterns = [
      /compare\s+([A-Za-z0-9\s]+?)\s+(?:to|with|and)\s+([A-Za-z0-9\s]+?)(?:\s|$|\?)/i,
      /project\s+([A-Za-z0-9]+)/gi
    ];
    
    const match1 = query.match(patterns[0]);
    if (match1) {
      projects.push(match1[1].trim(), match1[2].trim());
    } else {
      const matches = [...query.matchAll(patterns[1])];
      projects.push(...matches.map(m => m[1]));
    }
    
    return {
      intent: 'compare_projects',
      projects: projects
    };
  }
  
  // Vendor queries - improved patterns
  if (lowerQuery.includes('vendor')) {
    // Handle different vendor query patterns
    let vendorName = null;
    
    // Pattern 1: "vendor [name] spending/cost"
    const vendorNamePattern = /vendor\s+([A-Za-z0-9\s&]+?)(?:\s+spend|cost|spending|\?|$)/i;
    const match = query.match(vendorNamePattern);
    if (match && match[1]) {
      vendorName = match[1].trim();
    }
    
    return {
      intent: 'vendor_spending',
      vendor: vendorName
    };
  }
  
  // Also catch general spending/cost queries
  if ((lowerQuery.includes('show') || lowerQuery.includes('list') || lowerQuery.includes('get')) && 
      (lowerQuery.includes('vendor') || lowerQuery.includes('suppliers'))) {
    
    return {
      intent: 'vendor_spending',
      vendor: null  // Get all vendors
    };
  }
  
  // Project summary
  if ((lowerQuery.includes('project') || lowerQuery.includes('all projects')) && 
      (lowerQuery.includes('summary') || lowerQuery.includes('status') || 
       lowerQuery.includes('overview') || lowerQuery.includes('give me') ||
       lowerQuery.includes('show me') || lowerQuery.includes('list'))) {
    
    // Check if asking for all projects
    if (lowerQuery.includes('all projects') || 
        lowerQuery.includes('all project') ||
        (lowerQuery.includes('give') && lowerQuery.includes('projects')) ||
        lowerQuery.match(/^(give|show|list)\s+(me\s+)?all/i)) {
      return {
        intent: 'project_summary',
        project: null  // null means all projects
      };
    }
    
    // Extract specific project name
    const patterns = [
      /(?:project|of)\s+([A-Za-z0-9\-\s]+?)(?:\s+project)?\s+(?:summary|status)/i,
      /give\s+me\s+([A-Za-z0-9\-\s]+?)\s+project/i,
      /show\s+me\s+([A-Za-z0-9\-\s]+?)\s+project/i
    ];
    
    let projectName = null;
    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        projectName = match[1].trim();
        break;
      }
    }
    
    return {
      intent: 'project_summary',
      project: projectName
    };
  }
  
  return {
    intent: 'general',
    query: query
  };
}
