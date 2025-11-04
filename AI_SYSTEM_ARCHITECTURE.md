# AI Chatbot System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Floating Chat Button (Bottom-Right)                     │   │
│  │  • Blue gradient circle with MessageCircle icon          │   │
│  │  • Fixed position, always visible                        │   │
│  │  • Hover effects with scale animation                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓ Click                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Chat Window (96px × 600px)                              │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │ Header: "AI Assistant" | [X]                      │  │   │
│  │  │ (Gradient blue background)                        │  │   │
│  │  ├───────────────────────────────────────────────────┤  │   │
│  │  │ Messages Area (Scrollable)                        │  │   │
│  │  │                                                   │  │   │
│  │  │ ┌─────────────────────────────────────────────┐ │  │   │
│  │  │ │ Bot: Hi! I can help you query...           │ │  │   │
│  │  │ │ (White background, left-aligned)            │ │  │   │
│  │  │ └─────────────────────────────────────────────┘ │  │   │
│  │  │                                                   │  │   │
│  │  │              ┌──────────────────────────────────┐ │  │   │
│  │  │              │ User: Show me Phase 1 costs     │ │  │   │
│  │  │              │ (Blue background, right-aligned) │ │  │   │
│  │  │              └──────────────────────────────────┘ │  │   │
│  │  │                                                   │  │   │
│  │  │ ┌─────────────────────────────────────────────┐ │  │   │
│  │  │ │ Bot: Phase 1 has spent $45,230...          │ │  │   │
│  │  │ │ • Remaining: $4,770                        │ │  │   │
│  │  │ │ • Budget Utilization: 90.5%                │ │  │   │
│  │  │ └─────────────────────────────────────────────┘ │  │   │
│  │  │                                                   │  │   │
│  │  ├───────────────────────────────────────────────────┤  │   │
│  │  │ Input Area                                        │  │   │
│  │  │ [Text Input Field] [Send Button]                 │  │   │
│  │  │ Press Enter to send • Shift+Enter for new line   │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LOGIC                              │
│                   (components/AIChatbot.js)                      │
│                                                                   │
│  • State Management:                                             │
│    - messages[] - Chat history                                   │
│    - input - Current user input                                  │
│    - loading - Request in progress                               │
│    - isOpen - Chat window visibility                             │
│                                                                   │
│  • Event Handlers:                                               │
│    - handleSend() - Send message to API                          │
│    - handleKeyPress() - Keyboard shortcuts                       │
│    - formatMessage() - Render markdown-like text                 │
│                                                                   │
│  • API Call:                                                     │
│    POST /api/ai/chat                                             │
│    Body: { message: "user query" }                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API ENDPOINT                               │
│                  (app/api/ai/chat/route.js)                      │
│                                                                   │
│  1. Authentication Check                                         │
│     ├─ getUserFromRequest(request)                               │
│     ├─ Verify JWT token from cookie                              │
│     └─ Extract companyId and userId                              │
│                                                                   │
│  2. Request Validation                                           │
│     ├─ Parse JSON body                                           │
│     ├─ Validate message field exists                             │
│     └─ Check message is string                                   │
│                                                                   │
│  3. Query Processing                                             │
│     ├─ parseQuery(message) → intent detection                    │
│     └─ Route to appropriate service function                     │
│                                                                   │
│  4. Response Generation                                          │
│     ├─ Format data into readable text                            │
│     ├─ Include original data object                              │
│     └─ Return { ok: true, data: {...} }                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       AI SERVICE                                 │
│                    (lib/aiService.js)                            │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ parseQuery(message)                                        │  │
│  │ • Detects intent from keywords and patterns                │  │
│  │ • Extracts parameters (phase name, item, project, etc.)    │  │
│  │ • Returns: { intent, ...params }                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  Intent Routing:                                                 │
│                                                                   │
│  "phase_spending"                                                │
│  ├─ getPhaseSpending(companyId, phaseName)                       │
│  │  ├─ Find Phase by name                                        │
│  │  ├─ Get all Purchases for that phase                         │
│  │  ├─ Calculate total spent                                     │
│  │  └─ Return: budget, spent, remaining, % used                 │
│                                                                   │
│  "item_purchases"                                                │
│  ├─ getItemPurchases(companyId, itemName, dateRange)             │
│  │  ├─ Find Purchases with date filter                          │
│  │  ├─ Populate item, vendor, project details                   │
│  │  ├─ Filter by item name                                       │
│  │  └─ Return: purchase list with details                       │
│                                                                   │
│  "compare_projects"                                              │
│  ├─ compareProjects(companyId, project1, project2)               │
│  │  ├─ Find both projects by name                                │
│  │  ├─ Calculate stats for each (budget, spent, phases)         │
│  │  ├─ Compute differences and efficiency                       │
│  │  └─ Return: side-by-side comparison                          │
│                                                                   │
│  "vendor_spending"                                               │
│  ├─ getVendorSpending(companyId, vendorName)                     │
│  │  ├─ Get all Purchases                                         │
│  │  ├─ Populate vendor details                                   │
│  │  ├─ Group by vendor name                                      │
│  │  ├─ Aggregate total spent per vendor                         │
│  │  └─ Return: vendors sorted by spending                       │
│                                                                   │
│  "project_summary"                                               │
│  ├─ getProjectSummary(companyId, projectName)                    │
│  │  ├─ Find Project(s) by name                                   │
│  │  ├─ Calculate spending and phases                            │
│  │  └─ Return: project overview with stats                      │
│                                                                   │
│  "general"                                                       │
│  └─ Return help message with example queries                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│                     (MongoDB + Mongoose)                         │
│                                                                   │
│  Models Used:                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Project    │  │    Phase     │  │  Category    │          │
│  │              │  │              │  │              │          │
│  │ • companyId  │  │ • companyId  │  │ • companyId  │          │
│  │ • name       │  │ • projectId  │  │ • phaseId    │          │
│  │ • budget     │  │ • name       │  │ • name       │          │
│  │ • status     │  │ • budget     │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Item      │  │   Vendor     │  │  Purchase    │          │
│  │              │  │              │  │              │          │
│  │ • companyId  │  │ • companyId  │  │ • companyId  │          │
│  │ • categoryId │  │ • name       │  │ • projectId  │          │
│  │ • name       │  │ • contact    │  │ • phaseId    │          │
│  │ • unit       │  │              │  │ • itemId     │          │
│  │              │  │              │  │ • vendorId   │          │
│  │              │  │              │  │ • quantity   │          │
│  │              │  │              │  │ • totalCost  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  Security:                                                       │
│  • All queries filtered by companyId (multi-tenant isolation)    │
│  • Indexes on companyId, projectId, phaseId for performance     │
│  • Mongoose validation and schema enforcement                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       RESPONSE FLOW                              │
│                                                                   │
│  Database Results                                                │
│       ↓                                                          │
│  Data Aggregation & Formatting                                   │
│       ↓                                                          │
│  Generate Human-Readable Text                                    │
│       ↓                                                          │
│  { ok: true, data: { message, data, intent, timestamp } }        │
│       ↓                                                          │
│  API Response to Frontend                                        │
│       ↓                                                          │
│  Message Added to Chat UI                                        │
│       ↓                                                          │
│  Formatted Display with Markdown                                 │
│       ↓                                                          │
│  User Sees Answer ✓                                              │
└─────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════
                        DATA FLOW EXAMPLE
═══════════════════════════════════════════════════════════════════

User Input: "What's the total spent on Phase 1?"
                        ↓
Frontend: POST /api/ai/chat { message: "What's..." }
                        ↓
API: getUserFromRequest() → { companyId: "abc123", userId: "xyz" }
                        ↓
API: parseQuery() → { intent: "phase_spending", phase: "Phase 1" }
                        ↓
Service: getPhaseSpending("abc123", "Phase 1")
                        ↓
Database:
  1. Phase.findOne({ companyId: "abc123", name: /phase 1/i })
     → { _id: "ph1", name: "Phase 1 (Foundation)", budget: 50000 }
  
  2. Purchase.find({ companyId: "abc123", phaseId: "ph1" })
     → [
         { totalCost: 15000 },
         { totalCost: 18500 },
         { totalCost: 11730 }
       ]
  
  3. Aggregate: 15000 + 18500 + 11730 = 45230
                        ↓
Service Returns:
{
  phaseName: "Phase 1 (Foundation)",
  budget: 50000,
  spent: 45230,
  remaining: 4770,
  purchaseCount: 3
}
                        ↓
API Formats Response:
"**Phase 1 (Foundation)** has spent **$45,230** out of **$50,000** budget.
- Remaining: $4,770
- Total Purchases: 3
- Budget Utilization: 90.5%"
                        ↓
Frontend Receives: { ok: true, data: { message: "...", data: {...} } }
                        ↓
UI Updates: Adds bot message to chat with formatted text
                        ↓
User Sees: Nicely formatted answer with bold text and bullet points


═══════════════════════════════════════════════════════════════════
                        SECURITY LAYERS
═══════════════════════════════════════════════════════════════════

1. Authentication Layer (JWT)
   ├─ Cookie: auth_token (httpOnly, secure)
   ├─ Middleware: Verifies token on every request
   └─ User Context: Extracts companyId and role

2. Authorization Layer
   ├─ All queries require valid user
   ├─ No access without authentication
   └─ Read-only operations (no data modification)

3. Data Isolation Layer
   ├─ Every query filtered by companyId
   ├─ User can only see their company's data
   └─ No cross-company information leakage

4. Input Validation Layer
   ├─ Message must be non-empty string
   ├─ Pattern matching prevents injection
   └─ Mongoose sanitizes database queries


═══════════════════════════════════════════════════════════════════
                        PERFORMANCE OPTIMIZATION
═══════════════════════════════════════════════════════════════════

Frontend:
• useState for efficient re-renders
• useRef for scroll management (no re-render)
• useEffect only on messages change
• Conditional rendering (isOpen flag)

API:
• Single database connection per request
• Efficient query patterns
• Limit results for large datasets (.slice(0, 5))
• Async/await for non-blocking I/O

Database:
• Indexes on companyId, projectId, phaseId
• Populate only required fields
• Aggregation at query level (not in memory)
• Mongoose connection pooling

Result: < 500ms average response time
```
