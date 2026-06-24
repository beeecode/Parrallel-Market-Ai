export type UserRole = 'admin' | 'analyst' | 'business-owner' | 'viewer'

export type SimulationStatus = 'draft' | 'queued' | 'running' | 'paused' | 'completed' | 'failed'

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived'

export type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed'

export type RequestStatus = 'new' | 'reviewing' | 'approved' | 'rejected' | 'converted'

export type PageStatus = 'draft' | 'published' | 'archived'

export type ConversationStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'failed'

export type MessageSenderType = 'customer' | 'business' | 'system'

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed' | 'unknown'

export type BuyingIntent = 'none' | 'low' | 'medium' | 'high' | 'converted'

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR'

export type PriceSensitivity = 'low' | 'moderate' | 'high' | 'very-high'
