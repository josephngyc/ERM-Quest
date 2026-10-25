export interface QuizQuestion {
  id: string;
  topicId: 'topic1' | 'topic2' | 'topic3' | 'topic4' | 'topic6';
  topicTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceNote: string;
  difficulty: 'normal' | 'hard' | 'expert';
}

export interface NoteTopic {
  id: 'topic1' | 'topic2' | 'topic3' | 'topic4' | 'topic6';
  code: string;
  title: string;
  summary: string;
  keyPoints: string[];
  formulas?: { label: string; formula: string; explanation: string }[];
}

export const ERM_TOPICS: NoteTopic[] = [
  {
    id: 'topic1',
    code: 'Topic 1',
    title: 'Introduction to ERM & Supply Chain Flows',
    summary: 'Covers business foundations, ERM evolution from 1960s MRP to modern integrated ERP, the 3 supply chain flows (Material, Resource/Finance, Information), Data Silos, EDI, and the 3Ps of Business Process Re-engineering (People, Purpose, Preparation).',
    keyPoints: [
      'ERM software manages all assets and resources across finance, manufacturing, inventory, and HR.',
      '3 Key Flows: Material (freight delivery), Resources (financial settlement), and Information (the key that unlocks responsiveness to demand).',
      'Data Silos: Pockets of isolated data creating bottlenecks, lack of visibility, and inaccurate forecasts.',
      'BPR (Business Process Re-engineering): Radical redesign from ground up, supported by the 3Ps (People, Purpose, Preparation).',
      'Customization risks: High costs, upgrade friction, compatibility issues, and heavy testing requirements.',
      'EDI & RFID: Automated electronic data exchange; linked with RFID to send invoices instantly upon leaving factory gates.'
    ]
  },
  {
    id: 'topic2',
    code: 'Topic 2',
    title: 'Emerging Technologies & Process Mapping',
    summary: 'Explores AI/Machine Learning in supply chains, IoT wearables and tracking, Blockchain distributed ledgers, Chatbot types, and Business Process Mapping diagrams (symbols and Swimlane flows).',
    keyPoints: [
      'Machine Learning: Predictive demand forecasting, stock level optimization, and predictive maintenance for equipment (forklifts, conveyors).',
      'Warehouse layout optimization: Places frequently-picked goods close to packing stations.',
      'IoT in ERP: Wearable safety alerts (helmets, wristbands), shipping fleet fuel tracking, automated warehouse robots.',
      'Blockchain: Chronologically consistent blocks linked in a chain, cannot be modified without network consensus, settles payments without banking fees.',
      'Process Map Symbols: Rectangle = Activity/Task, Diamond = Decision Point, Oval = Start/Stop Trigger, Directional Arrow = Flow Line.',
      'As-Is vs To-Be: "As-Is" maps current existing workflows; "To-Be" represents the redesigned, optimized future state.'
    ]
  },
  {
    id: 'topic3',
    code: 'Topic 3',
    title: 'Sales Order Process & Order Fulfilment',
    summary: 'The sales cycle from Lead -> Prospect -> Opportunity -> Quotation -> Customer. Core master data, 4 transaction entities (Sold-to, Ship-to, Bill-to, Payer), and the 4 fulfilment steps (Picking, Packing, Loading, Goods Issue).',
    keyPoints: [
      'Sales Progression: Lead -> meets criteria -> Prospect -> sales demo -> Opportunity -> binding quotation accepted -> Customer.',
      'Quotation: A legally binding contract listing terms, conditions, and pre-defined pricing.',
      '4 Transaction Parties: Sold-to (buyer placing order), Ship-to (delivery destination), Bill-to (invoice recipient), Payer (entity settling payment).',
      'Order Fulfilment Sequence: Picking (from warehouse bins with Picking List) -> Packing (in boxes with Packing Slip) -> Loading (onto vehicle) -> Goods Issue.',
      'Goods Issue: Officially records release of goods, reduces Inventory balance, increases Cost of Goods Sold (COGS), and alerts Finance to issue Invoice.',
      'Master Data Types: Customer Master (by sales area), Material Master (used across MM/SD/PP/FI), Condition Master (prices, discounts, freights, taxes).'
    ]
  },
  {
    id: 'topic4',
    code: 'Topic 4 & 6',
    title: 'Inventory, MRP, EOQ & Scheduling',
    summary: 'Plant, Storage Location, Work Centre, BOM, Routing, Product Groups, 5 MRP inputs, Forward vs Backward scheduling, Safety Stock, Reorder Point (ROP), and Economic Order Quantity (EOQ).',
    keyPoints: [
      'Workspace Hierarchy: Plant (factory/warehouse) -> Storage Location (raw materials, WIP, finished goods) -> Work Centre (machine/assembly line where value is added).',
      'Bill of Materials (BOM): List of components and quantities needed to produce an item (single-level or multi-level).',
      'Routing: Sequential production operations outlining What, Where, When, and How; basis for Capacity Requirements Planning (CRP) and costing.',
      '5 MRP Inputs: BOM, Master Production Schedule (MPS), Planned lead-times, Inventory on hand, Outstanding orders status.',
      'Forward Scheduling: Starts as soon as materials are available, determines earliest completion date. Backward Scheduling: Starts from desired delivery date, works backwards for latest start date.',
      'EOQ Model: Minimizes total inventory costs where Annual Ordering Cost = Annual Holding Cost.'
    ],
    formulas: [
      {
        label: 'Reorder Point (ROP)',
        formula: 'ROP = (Average Demand × Lead Time) + Safety Stock',
        explanation: 'Calculates the inventory trigger point to place a replenishment order before buffer stock is reached.'
      },
      {
        label: 'Economic Order Quantity (EOQ)',
        formula: 'EOQ = √( (2 × D × S) / H )',
        explanation: 'D = Annual Demand (units/yr), S = Ordering Cost ($/order), H = Holding Cost ($/unit/yr).'
      },
      {
        label: 'Exponential Smoothing Forecast',
        formula: 'New Forecast = Last Forecast + α × (Last Actual Demand - Last Forecast)',
        explanation: 'α (alpha) is between 0 and 1. Lower α places less weight on recent demand fluctuations.'
      }
    ]
  }
];

export const BUILTIN_QUESTIONS: QuizQuestion[] = [
  // --- TOPIC 1: INTRO & FLOWS ---
  {
    id: 'q1-1',
    topicId: 'topic1',
    topicTitle: 'Topic 1: ERM Foundations',
    question: 'According to Topic 1 notes, what is the core meaning of Enterprise Resource Management (ERM)?',
    options: [
      'Software that manages all assets and resources (GL, AR/AP, manufacturing, inventory, HR)',
      'A standalone spreadsheet tool solely used by the accounting department',
      'A hardware device installed in delivery trucks to track mileage',
      'A social media management portal for consumer marketing'
    ],
    correctIndex: 0,
    explanation: 'ERM refers to integrated commercial software that manages all of a company\'s assets and resources including ledger, inventory, manufacturing, and HR.',
    sourceNote: 'Topic 1, Page 2: Meaning of ERM',
    difficulty: 'normal'
  },
  {
    id: 'q1-2',
    topicId: 'topic1',
    topicTitle: 'Topic 1: Supply Chain Flows',
    question: 'Which of the 3 key supply chain flows is described as the key that unlocks responsiveness to customer demand?',
    options: [
      'Material flow',
      'Resource & finance flow',
      'Information flow',
      'Transport vehicle flow'
    ],
    correctIndex: 2,
    explanation: 'Information flows are multifaceted and unlock responsiveness to demand by coordinating supply-side and demand-side data.',
    sourceNote: 'Topic 1, Page 7: Role of Information in Global Supply Chains',
    difficulty: 'normal'
  },
  {
    id: 'q1-3',
    topicId: 'topic1',
    topicTitle: 'Topic 1: Business Process Re-engineering',
    question: 'What are the essential "3Ps" required to support a Business Process Re-engineering (BPR) effort?',
    options: [
      'Planning, Profit, Production',
      'People, Purpose, Preparation',
      'Packaging, Pricing, Promotion',
      'Procurement, Posting, Plant'
    ],
    correctIndex: 1,
    explanation: 'Dr. Michael Hammer and ERM notes emphasize the 3Ps: People (management, department, employee), Purpose (vision), and Preparation (training and roadmap).',
    sourceNote: 'Topic 1, Page 6: The 3Ps: People | Purpose | Preparation',
    difficulty: 'normal'
  },
  {
    id: 'q1-4',
    topicId: 'topic1',
    topicTitle: 'Topic 1: Data Silos',
    question: 'What is a "Supply Chain Data Silo"?',
    options: [
      'An underground bunker where physical servers are safely locked',
      'A pocket of the supply chain where data becomes isolated and difficult to access',
      'A bulk grain container used by agricultural manufacturers',
      'An automated high-speed database replication cluster'
    ],
    correctIndex: 1,
    explanation: 'A data silo is created when disparate, disconnected departmental systems conceal data, creating bottlenecks and reducing visibility.',
    sourceNote: 'Topic 1, Page 8: Supply Chain Data Silo',
    difficulty: 'normal'
  },
  {
    id: 'q1-5',
    topicId: 'topic1',
    topicTitle: 'Topic 1: Customization vs BPR',
    question: 'What is a significant challenge when heavily customizing an off-the-shelf ERP system?',
    options: [
      'It makes upgrading to newer software versions difficult and costly',
      'It prevents computers from connecting to the office local network',
      'It causes hardware CPU overheating in standard office laptops',
      'It permanently deletes all previous company balance sheets'
    ],
    correctIndex: 0,
    explanation: 'Heavy customizations modify source code, which frequently conflicts with updates in new ERP releases, demanding costly rework and re-testing.',
    sourceNote: 'Topic 1, Page 5: Challenges of Customizing an ERP System',
    difficulty: 'hard'
  },
  {
    id: 'q1-6',
    topicId: 'topic1',
    topicTitle: 'Topic 1: EDI & RFID',
    question: 'When Electronic Data Interchange (EDI) is integrated with RFID technology, what automated capability is unlocked?',
    options: [
      'Invoices can be triggered automatically the moment goods pass the factory gates',
      'Employees no longer need to be paid via bank transfers',
      'Suppliers do not need to deliver physical goods anymore',
      'Tax authorities automatically forgive annual company liabilities'
    ],
    correctIndex: 0,
    explanation: 'Linked with RFID (automatic identification), EDI can send the invoice automatically precisely when the shipment leaves the factory gates.',
    sourceNote: 'Topic 1, Page 7: Electronic Data Interchange (EDI)',
    difficulty: 'hard'
  },

  // --- TOPIC 2: EMERGING TECH & PROCESS MAPPING ---
  {
    id: 'q2-1',
    topicId: 'topic2',
    topicTitle: 'Topic 2: AI in Warehouse Management',
    question: 'How did BMW utilize machine learning algorithms in its global warehouse and assembly network?',
    options: [
      'To monitor items from manufacturing to point-of-sale across 31 locations',
      'To eliminate all human engineers from its Bavarian design headquarters',
      'To build flying delivery drones without road traffic compliance',
      'To replace all automotive assembly robots with manual craftsmen'
    ],
    correctIndex: 0,
    explanation: 'BMW utilizes learning algorithms to monitor items from manufacturing to point of sale across 31 locations in different countries with precision.',
    sourceNote: 'Topic 2, Page 5: Warehouse Management with AI',
    difficulty: 'normal'
  },
  {
    id: 'q2-2',
    topicId: 'topic2',
    topicTitle: 'Topic 2: Process Map Symbols',
    question: 'In standard business process mapping diagrams, which geometric shape denotes an ACTIVITY (a step in the process)?',
    options: [
      'A Rectangle',
      'A Diamond',
      'An Oval',
      'A Triangle'
    ],
    correctIndex: 0,
    explanation: 'Activities and steps (value-added and non-value-added) are depicted with rectangles in process maps.',
    sourceNote: 'Topic 2, Page 8: Process Map Diagram Symbols',
    difficulty: 'normal'
  },
  {
    id: 'q2-3',
    topicId: 'topic2',
    topicTitle: 'Topic 2: Process Map Symbols',
    question: 'In a process map flowchart, what does a DIAMOND symbol represent?',
    options: [
      'A Decision point with alternative branches',
      'The final invoice payment stamp',
      'A storage warehouse physical location',
      'The beginning and ending trigger point'
    ],
    correctIndex: 0,
    explanation: 'Decisions are depicted with diamonds, representing choices that lead to different process outcomes.',
    sourceNote: 'Topic 2, Page 8: Process Map Diagram Symbols',
    difficulty: 'normal'
  },
  {
    id: 'q2-4',
    topicId: 'topic2',
    topicTitle: 'Topic 2: As-Is vs To-Be Maps',
    question: 'What is the purpose of an "As-Is" process map compared to a "To-Be" process map?',
    options: [
      '"As-Is" maps current actual processes to find gaps; "To-Be" represents the redesigned, optimized future state',
      '"As-Is" is used only for tax filing, while "To-Be" is used only for marketing posters',
      '"As-Is" must be drawn on paper, while "To-Be" must be stored on blockchain',
      'There is no difference; both terms refer to identical documents'
    ],
    correctIndex: 0,
    explanation: '"As-is" maps current operations to help identify bottlenecks and develop ERP requirements; "to-be" is the visual representation of the redesigned, more efficient process.',
    sourceNote: 'Topic 2, Page 7 & 9: As-Is vs To-Be Maps',
    difficulty: 'normal'
  },
  {
    id: 'q2-5',
    topicId: 'topic2',
    topicTitle: 'Topic 2: Blockchain in Business',
    question: 'Why is data stored on a blockchain considered chronologically consistent and tamper-resistant?',
    options: [
      'Blocks are linked in a chain and cannot be modified without consensus from the network',
      'The data is encrypted and permanently locked onto a single central mainframe',
      'Only government officials hold the private cryptographic password',
      'Data is wiped clean every 24 hours to prevent fraud'
    ],
    correctIndex: 0,
    explanation: 'Blockchain stores data in chronological blocks linked together; you cannot delete or modify the chain without network consensus.',
    sourceNote: 'Topic 2, Page 4: Blockchain in Business',
    difficulty: 'hard'
  },
  {
    id: 'q2-6',
    topicId: 'topic2',
    topicTitle: 'Topic 2: Machine Learning in SCM',
    question: 'How does ML-driven warehouse layout optimization reduce order fulfilment costs?',
    options: [
      'By placing frequently sold items closer to packing stations to reduce worker transit time',
      'By deleting low-selling SKUs from the database automatically',
      'By turning off warehouse lighting during daytime picking shifts',
      'By ordering workers to pack items without checking the packing slip'
    ],
    correctIndex: 0,
    explanation: 'ML analyzes item movement patterns and worker paths: fast-moving items are placed closer to packing stations to slash picking time.',
    sourceNote: 'Topic 2, Page 3: Warehouse Layout and Picking Optimization',
    difficulty: 'normal'
  },

  // --- TOPIC 3: SALES ORDER PROCESS ---
  {
    id: 'q3-1',
    topicId: 'topic3',
    topicTitle: 'Topic 3: Sales Process Funnel',
    question: 'In the sales process, at what point does a potential customer (Lead) become a "Prospect"?',
    options: [
      'When the Lead meets the company\'s defined qualifying criteria',
      'As soon as they click on an online social media banner',
      'After the customer has paid the full invoice amount in cash',
      'When the warehouse supervisor prints the picking list'
    ],
    correctIndex: 0,
    explanation: 'A Lead becomes a "Prospect" when the Lead meets the company’s criteria, prompting a sales representative to reach out and present an offer.',
    sourceNote: 'Topic 3, Page 1: The Sales Process',
    difficulty: 'normal'
  },
  {
    id: 'q3-2',
    topicId: 'topic3',
    topicTitle: 'Topic 3: Quotation vs Sales Order',
    question: 'What defines a "Quotation" in the enterprise sales process?',
    options: [
      'A legally binding offer to deliver products/services with fixed terms and pre-defined pricing',
      'A non-binding informal verbal chat over coffee',
      'A receipt issued after the customer has paid the invoice',
      'A warehouse document authorizing items to be loaded onto trucks'
    ],
    correctIndex: 0,
    explanation: 'A Quotation is a legally binding offer to deliver goods or services at fixed conditions and pre-defined price if accepted by the prospect.',
    sourceNote: 'Topic 3, Page 2 & 3: Inquiries and Quotations',
    difficulty: 'normal'
  },
  {
    id: 'q3-3',
    topicId: 'topic3',
    topicTitle: 'Topic 3: The 4 Transaction Roles',
    question: 'Which entity in an ERP sales transaction is the location where goods are physically delivered?',
    options: [
      'Ship to Party',
      'Sold to Party',
      'Bill to Party',
      'Payer'
    ],
    correctIndex: 0,
    explanation: 'Ship to Party is the specific address or facility where the goods are physically delivered (which may differ from who placed the order).',
    sourceNote: 'Topic 3, Page 10: Definitions and Roles in Sales Process',
    difficulty: 'normal'
  },
  {
    id: 'q3-4',
    topicId: 'topic3',
    topicTitle: 'Topic 3: The 4 Transaction Roles',
    question: 'If a parent company handles the payment settlement for an order placed by a branch subsidiary, the parent company acts as which party?',
    options: [
      'The Payer (and Bill-to Party)',
      'The Sold-to Party only',
      'The Work Centre',
      'The Picking Station'
    ],
    correctIndex: 0,
    explanation: 'The Payer is the entity responsible for settling the payment, while the branch subsidiary was the Sold-to Party who initiated the order.',
    sourceNote: 'Topic 3, Page 10: Key terms used in sales order process',
    difficulty: 'hard'
  },
  {
    id: 'q3-5',
    topicId: 'topic3',
    topicTitle: 'Topic 3: Order Fulfilment Sequence',
    question: 'What is the correct chronological sequence of physical warehouse order fulfilment activities?',
    options: [
      'Picking -> Packing -> Loading -> Goods Issue',
      'Goods Issue -> Loading -> Picking -> Packing',
      'Loading -> Invoicing -> Picking -> Packing',
      'Packing -> Goods Issue -> Picking -> Loading'
    ],
    correctIndex: 0,
    explanation: 'The standard warehouse fulfilment sequence is: Picking items from bins -> Packing with packing slip -> Loading onto transport vehicle -> Goods Issue.',
    sourceNote: 'Topic 3, Page 3 & 4: Order Fulfilment Process',
    difficulty: 'normal'
  },
  {
    id: 'q3-6',
    topicId: 'topic3',
    topicTitle: 'Topic 3: Goods Issue Accounting',
    question: 'What financial and inventory adjustments occur when the warehouse posts a "Goods Issue"?',
    options: [
      'Reduces Inventory balance and increases Cost of Goods Sold (COGS)',
      'Increases Cash balance and decreases Accounts Payable',
      'Doubles the sales revenue and eliminates all tax liabilities',
      'Freezes all warehouse conveyor belts until the end of the fiscal month'
    ],
    correctIndex: 0,
    explanation: 'Posting Goods Issue officially releases goods from stock, reducing the "Inventory" asset balance and increasing "Cost of Goods Sold" (COGS).',
    sourceNote: 'Topic 3, Page 4 & Topic 6, Page 4: Goods Issue',
    difficulty: 'hard'
  },
  {
    id: 'q3-7',
    topicId: 'topic3',
    topicTitle: 'Topic 3: Master Data Types',
    question: 'Condition Master Data in ERP systems includes which category of information?',
    options: [
      'Prices, surcharges, discounts, freights, and taxes',
      'Employee home addresses and payroll bank accounts',
      'Factory building blueprints and architectural drawings',
      'Supplier vehicle engine displacement specifications'
    ],
    correctIndex: 0,
    explanation: 'Condition master data includes prices, surcharges, discounts, freight costs, and taxes applied to sales transactions.',
    sourceNote: 'Topic 3, Page 7: Condition master data',
    difficulty: 'normal'
  },

  // --- TOPIC 4 & 6: INVENTORY, EOQ & SCHEDULING ---
  {
    id: 'q4-1',
    topicId: 'topic4',
    topicTitle: 'Topic 4: Production Workspace Structure',
    question: 'In manufacturing ERP (such as SAP), what is a "Work Centre"?',
    options: [
      'A physical machine, assembly line, or workgroup where value-adding operations occur',
      'A regional sales headquarters that hosts client cocktail parties',
      'The legal boardroom where dividends are announced to shareholders',
      'The parking garage where transport delivery trucks park overnight'
    ],
    correctIndex: 0,
    explanation: 'A Work Centre is where actual value-adding manufacturing operations occur, defining labor and machine capacities used in scheduling and costing.',
    sourceNote: 'Topic 4, Page 2 & 6: Work Center',
    difficulty: 'normal'
  },
  {
    id: 'q4-2',
    topicId: 'topic4',
    topicTitle: 'Topic 4: Bill of Materials (BOM)',
    question: 'What is a Bill of Materials (BOM) in ERP manufacturing?',
    options: [
      'A comprehensive list of components and raw materials needed to manufacture a product',
      'An invoice sent to customers requesting payment for electricity bills',
      'A government customs declaration for international sea freight',
      'A list of employee sick leaves recorded by human resources'
    ],
    correctIndex: 0,
    explanation: 'A Bill of Materials (BOM) defines the number and type of components needed to manufacture an end product or assembly.',
    sourceNote: 'Topic 4, Page 4 & Topic 6, Page 5: Bill of Materials',
    difficulty: 'normal'
  },
  {
    id: 'q4-3',
    topicId: 'topic4',
    topicTitle: 'Topic 4: Production Routing',
    question: 'What information does a production "Routing" provide in manufacturing planning?',
    options: [
      'The sequential operations (steps) to produce an item: What, Where, When, and How',
      'The GPS navigation directions for the marketing sales reps to visit clients',
      'The electrical wiring schematic of the company server room',
      'The personal career progression route of junior interns'
    ],
    correctIndex: 0,
    explanation: 'Routings contain sequential steps (operations) specifying the "What, Where, When, How" to produce a material, acting as a template for work orders.',
    sourceNote: 'Topic 4, Page 5: Routing',
    difficulty: 'normal'
  },
  {
    id: 'q4-4',
    topicId: 'topic4',
    topicTitle: 'Topic 4: Reorder Point (ROP)',
    question: 'What is the formula used to calculate the Reorder Point (ROP) in consumption-based planning?',
    options: [
      'ROP = (Average Demand × Lead Time) + Safety Stock',
      'ROP = (Total Sales ÷ Number of Employees) - Annual Taxes',
      'ROP = (Holding Cost × Unit Price) ÷ Machine Capacity',
      'ROP = (Lead Time + Batch Quantity) × Discount Rate'
    ],
    correctIndex: 0,
    explanation: 'Reorder Point ensures timely replenishment by combining expected demand during lead time plus safety stock buffer.',
    sourceNote: 'Topic 4, Page 11: Reorder Point (ROP) Formula',
    difficulty: 'hard'
  },
  {
    id: 'q4-5',
    topicId: 'topic4',
    topicTitle: 'Topic 4: Economic Order Quantity (EOQ)',
    question: 'In the EOQ formula EOQ = √(2DS / H), what does variable "S" represent?',
    options: [
      'Ordering cost per order ($/order)',
      'Safety stock units stored in warehouse',
      'Selling price of the finished skateboard',
      'Supplier rating percentage score'
    ],
    correctIndex: 0,
    explanation: 'In EOQ, D = Annual Demand, S = Ordering cost per order, and H = Annual holding cost per unit per year.',
    sourceNote: 'Topic 4, Page 12: EOQ Model Formula',
    difficulty: 'normal'
  },
  {
    id: 'q4-6',
    topicId: 'topic4',
    topicTitle: 'Topic 4: EOQ Cost Behavior',
    question: 'Under standard EOQ assumptions, what is true about costs when ordering at the exact EOQ quantity (Q*)?',
    options: [
      'Annual ordering cost equals annual holding cost, minimizing total inventory cost',
      'Holding cost drops to exactly zero dollars per year',
      'Ordering cost exceeds holding cost by a factor of 10',
      'Purchasing cost of the items is completely waived by suppliers'
    ],
    correctIndex: 0,
    explanation: 'At the EOQ, annual ordering cost exactly equals annual holding cost, achieving the minimum total relevant annual inventory cost.',
    sourceNote: 'Topic 4, Page 13 & 14: EOQ Model Curves and Assumptions',
    difficulty: 'hard'
  },
  {
    id: 'q4-7',
    topicId: 'topic6',
    topicTitle: 'Topic 6: Forward vs Backward Scheduling',
    question: 'How does Backward Scheduling differ from Forward Scheduling in delivery planning?',
    options: [
      'Backward scheduling starts from the desired delivery date and works in reverse order for latest start dates',
      'Backward scheduling always results in delivering shipments 6 months late',
      'Forward scheduling begins only after the customer receives the invoice',
      'Backward scheduling requires delivery trucks to drive in reverse gear'
    ],
    correctIndex: 0,
    explanation: 'Backward scheduling starts with the target delivery date and schedules activities backwards in time to minimize holding time and delays.',
    sourceNote: 'Topic 6, Page 2: Backward Scheduling',
    difficulty: 'normal'
  },
  {
    id: 'q4-8',
    topicId: 'topic6',
    topicTitle: 'Topic 6: 5 Inputs to MRP',
    question: 'Which of the following is NOT one of the 5 required inputs to the Material Requirements Planning (MRP) process?',
    options: [
      'Social media follower growth metrics',
      'A Bill of Materials (BOM) for each end product',
      'A Master Production Schedule (MPS)',
      'Accurate inventory on hand balances'
    ],
    correctIndex: 0,
    explanation: 'The 5 MRP inputs are: 1. BOM, 2. Master Production Schedule (MPS), 3. Planned lead-times, 4. Inventory on hand, 5. Status of outstanding orders.',
    sourceNote: 'Topic 6, Page 5: Planning and scheduling with MRP',
    difficulty: 'normal'
  },
  {
    id: 'q4-9',
    topicId: 'topic6',
    topicTitle: 'Topic 6: Exponential Smoothing Factors',
    question: 'In exponential smoothing demand forecasting, what does a low value of Alpha (α, close to 0) signify?',
    options: [
      'The forecast places little weight on recent demand fluctuations and relies heavily on past history',
      'The forecast only considers yesterday\'s single transaction',
      'The product demand is in severe decline and must be discontinued',
      'The company has zero safety stock remaining in storage'
    ],
    correctIndex: 0,
    explanation: 'When α is lower, the forecast places little weight on recent demand fluctuations, smoothing out temporary spikes.',
    sourceNote: 'Topic 6, Page 4: Exponential Smoothing Alpha Factor',
    difficulty: 'hard'
  },
  {
    id: 'q4-10',
    topicId: 'topic6',
    topicTitle: 'Topic 6: Time-Phased Lead Time Calculation',
    question: 'In the Topic 6 Skateboard BOM example with time-phased assembly (weeks 1 to 10), what was the calculated total lead time to manufacture and assemble?',
    options: [
      '9 weeks (from week 1 start to week 10 finish)',
      '2 weeks only',
      '25 weeks',
      '52 weeks'
    ],
    correctIndex: 0,
    explanation: 'Page 6 demonstrates the time-phased product structure where the total lead time to manufacture and assemble is 10 - 1 = 9 weeks.',
    sourceNote: 'Topic 6, Page 6: Time-phased Product Structure',
    difficulty: 'expert'
  }
];
