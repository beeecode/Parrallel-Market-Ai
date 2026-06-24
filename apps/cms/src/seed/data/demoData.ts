export type DemoProduct = {
  category: string
  currentPrice: number
  description: string
  name: string
  slug: string
  targetLocation: string
  targetMarket: string
}

export type DemoSimulation = {
  completedAt: string
  conversationCount: number
  customerCount: number
  productSlug: string
  purchaseRate: number
  repeatRate: number
  revenueMaximum: number
  revenueMinimum: number
  startedAt: string
  successProbability: number
  targetAudience: string
  targetLocation: string
  title: string
}

export type DemoAgent = {
  age: number
  buyingBehaviour: string
  communicationStyle: string
  incomeLevel: string
  interests: string[]
  name: string
  occupation: string
  personality: string
  priceSensitivity: 'high' | 'low' | 'moderate' | 'very-high'
}

export type DemoMessage = {
  agentName: string
  buyingIntent: 'converted' | 'high' | 'low' | 'medium' | 'none'
  content: string
  objectionCategory?: string
  senderType: 'business' | 'customer' | 'system'
  sentiment: 'mixed' | 'negative' | 'neutral' | 'positive' | 'unknown'
  sentAt: string
}

export const demoProducts: DemoProduct[] = [
  {
    category: 'Food and hospitality',
    currentPrice: 4_200,
    description:
      'A Lagos shawarma menu testing delivery pricing, portion sizes, trust signals, and customer demand.',
    name: 'Shawarma Spot Menu',
    slug: 'shawarma-spot-menu',
    targetLocation: 'Lagos, Nigeria',
    targetMarket: 'Urban food delivery customers',
  },
  {
    category: 'Food delivery technology',
    currentPrice: 2_500,
    description:
      'A farm-to-door delivery application testing convenience, produce quality, and subscription demand.',
    name: 'FreshFarm Delivery App',
    slug: 'freshfarm-delivery-app',
    targetLocation: 'Abuja, Nigeria',
    targetMarket: 'Households buying fresh produce online',
  },
  {
    category: 'Education technology',
    currentPrice: 15_000,
    description:
      'An online tutoring service testing pricing, parent trust, lesson flexibility, and repeat enrolment.',
    name: 'StudyBuddy Online Tutoring',
    slug: 'studybuddy-online-tutoring',
    targetLocation: 'Lagos, Nigeria',
    targetMarket: 'Parents and university students seeking tutoring',
  },
]

export const demoSimulations: DemoSimulation[] = [
  {
    completedAt: '2024-05-20T16:00:00.000Z',
    conversationCount: 3_842,
    customerCount: 1_000,
    productSlug: 'shawarma-spot-menu',
    purchaseRate: 23.7,
    repeatRate: 11.3,
    revenueMaximum: 6_800_000,
    revenueMinimum: 4_200_000,
    startedAt: '2024-05-20T09:00:00.000Z',
    successProbability: 72,
    targetAudience:
      'Lagos residents aged 18 to 40 who regularly order quick-service meals through chat or delivery applications.',
    targetLocation: 'Lagos, Nigeria',
    title: 'Shawarma Spot Menu',
  },
  {
    completedAt: '2024-05-18T16:00:00.000Z',
    conversationCount: 2_104,
    customerCount: 750,
    productSlug: 'freshfarm-delivery-app',
    purchaseRate: 18.4,
    repeatRate: 9.6,
    revenueMaximum: 3_700_000,
    revenueMinimum: 2_100_000,
    startedAt: '2024-05-18T09:00:00.000Z',
    successProbability: 61,
    targetAudience:
      'Abuja households and professionals who value reliable access to fresh produce and convenient delivery.',
    targetLocation: 'Abuja, Nigeria',
    title: 'FreshFarm Delivery App',
  },
  {
    completedAt: '2024-05-15T16:00:00.000Z',
    conversationCount: 1_286,
    customerCount: 500,
    productSlug: 'studybuddy-online-tutoring',
    purchaseRate: 14.2,
    repeatRate: 7.8,
    revenueMaximum: 2_500_000,
    revenueMinimum: 1_200_000,
    startedAt: '2024-05-15T09:00:00.000Z',
    successProbability: 48,
    targetAudience:
      'Parents, secondary-school learners, and university students comparing flexible online tutoring options.',
    targetLocation: 'Lagos, Nigeria',
    title: 'StudyBuddy Online Tutoring',
  },
]

export const demoAgents: DemoAgent[] = [
  {
    age: 24,
    buyingBehaviour: 'Compares delivery cost before deciding and responds to conditional discounts.',
    communicationStyle: 'Friendly, direct, and conversational.',
    incomeLevel: 'Middle income',
    interests: ['Food delivery', 'Late-night meals', 'Discounts'],
    name: 'Tunde',
    occupation: 'Software support specialist',
    personality: 'Practical and value-conscious.',
    priceSensitivity: 'high',
  },
  {
    age: 28,
    buyingBehaviour: 'Prefers smaller portions and lower entry prices before trying a new vendor.',
    communicationStyle: 'Brief and polite.',
    incomeLevel: 'Middle income',
    interests: ['Portion control', 'Convenience', 'Local food'],
    name: 'Bola',
    occupation: 'Small business owner',
    personality: 'Careful and convenience-focused.',
    priceSensitivity: 'moderate',
  },
  {
    age: 21,
    buyingBehaviour: 'Compares prices aggressively and needs visible value before purchase.',
    communicationStyle: 'Informal and expressive.',
    incomeLevel: 'Student income',
    interests: ['Student deals', 'Social dining', 'Budget meals'],
    name: 'Ada',
    occupation: 'University student',
    personality: 'Social, curious, and budget-aware.',
    priceSensitivity: 'very-high',
  },
  {
    age: 30,
    buyingBehaviour: 'Prioritises predictable delivery time over small price differences.',
    communicationStyle: 'Clear and time-conscious.',
    incomeLevel: 'Upper middle income',
    interests: ['Fast delivery', 'Meal planning', 'Quality service'],
    name: 'Emeka',
    occupation: 'Operations manager',
    personality: 'Organised and reliability-focused.',
    priceSensitivity: 'low',
  },
  {
    age: 26,
    buyingBehaviour: 'Looks for proof, reviews, and trusted checkout options before ordering.',
    communicationStyle: 'Question-led and cautious.',
    incomeLevel: 'Middle income',
    interests: ['Online safety', 'Reviews', 'Discounts'],
    name: 'Zainab',
    occupation: 'Digital marketer',
    personality: 'Analytical and trust-conscious.',
    priceSensitivity: 'moderate',
  },
  {
    age: 27,
    buyingBehaviour: 'Chooses based on protein preference and menu customisation.',
    communicationStyle: 'Relaxed and decisive.',
    incomeLevel: 'Middle income',
    interests: ['Fitness', 'Chicken meals', 'Custom orders'],
    name: 'Musa',
    occupation: 'Fitness coach',
    personality: 'Decisive and preference-driven.',
    priceSensitivity: 'moderate',
  },
]

export const demoMessages: DemoMessage[] = [
  {
    agentName: 'Tunde',
    buyingIntent: 'medium',
    content: 'Is delivery available to Yaba?',
    senderType: 'customer',
    sentiment: 'neutral',
    sentAt: '2024-05-20T11:30:00.000Z',
  },
  {
    agentName: 'Tunde',
    buyingIntent: 'medium',
    content: 'Yes. Delivery to Yaba is available for just ₦800.',
    senderType: 'business',
    sentiment: 'positive',
    sentAt: '2024-05-20T11:30:20.000Z',
  },
  {
    agentName: 'Tunde',
    buyingIntent: 'medium',
    content: "That's a bit high. Can you reduce it?",
    objectionCategory: 'delivery-fee',
    senderType: 'customer',
    sentiment: 'negative',
    sentAt: '2024-05-20T11:31:00.000Z',
  },
  {
    agentName: 'Tunde',
    buyingIntent: 'high',
    content: 'We can do ₦500 if your order is above ₦4,000.',
    senderType: 'business',
    sentiment: 'positive',
    sentAt: '2024-05-20T11:31:20.000Z',
  },
  {
    agentName: 'Tunde',
    buyingIntent: 'high',
    content: 'Okay cool. Do you have pepper extra?',
    senderType: 'customer',
    sentiment: 'positive',
    sentAt: '2024-05-20T11:31:40.000Z',
  },
  {
    agentName: 'Tunde',
    buyingIntent: 'converted',
    content: 'Yes. Pepper extra is available.',
    senderType: 'business',
    sentiment: 'positive',
    sentAt: '2024-05-20T11:32:00.000Z',
  },
  {
    agentName: 'Bola',
    buyingIntent: 'medium',
    content: 'Do you have a smaller pack?',
    senderType: 'customer',
    sentiment: 'neutral',
    sentAt: '2024-05-20T11:33:00.000Z',
  },
  {
    agentName: 'Ada',
    buyingIntent: 'low',
    content: 'Your prices are a bit high.',
    objectionCategory: 'price',
    senderType: 'customer',
    sentiment: 'negative',
    sentAt: '2024-05-20T11:34:00.000Z',
  },
  {
    agentName: 'Emeka',
    buyingIntent: 'medium',
    content: 'How long does delivery take?',
    senderType: 'customer',
    sentiment: 'neutral',
    sentAt: '2024-05-20T11:35:00.000Z',
  },
  {
    agentName: 'Zainab',
    buyingIntent: 'low',
    content: 'Do you have discounts and a trusted checkout option?',
    objectionCategory: 'checkout-trust',
    senderType: 'customer',
    sentiment: 'mixed',
    sentAt: '2024-05-20T11:36:00.000Z',
  },
  {
    agentName: 'Musa',
    buyingIntent: 'high',
    content: 'I prefer chicken over beef.',
    senderType: 'customer',
    sentiment: 'positive',
    sentAt: '2024-05-20T11:37:00.000Z',
  },
]

export const demoPages = [
  {
    metaDescription: 'Parallel Market AI product overview and market simulation capabilities.',
    metaTitle: 'Parallel Market AI',
    slug: 'parallel-market-ai',
    status: 'published' as const,
    title: 'Parallel Market AI',
  },
  {
    metaDescription: 'Internal draft notes for the future simulation methodology page.',
    metaTitle: 'Simulation Methodology',
    slug: 'simulation-methodology',
    status: 'draft' as const,
    title: 'Simulation Methodology',
  },
]
