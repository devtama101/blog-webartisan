import { db } from '@/db'

interface GroqUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
}

interface LogAiUsageParams {
  userId?: string
  endpoint: string
  usage?: GroqUsage
  model?: string
}

/**
 * Logs AI usage to the database for tracking and analytics
 * @param params - Usage parameters including userId (optional), endpoint, and usage data
 */
export async function logAiUsage({ userId, endpoint, usage, model }: LogAiUsageParams) {
  try {
    const data: any = {
      endpoint,
      inputTokens: usage?.prompt_tokens,
      outputTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      model: model || 'llama-3.3-70b-versatile',
    }

    // Only include userId if it's provided (not undefined/null)
    // This avoids Prisma relation errors when userId is null
    if (userId) {
      data.userId = userId
    }

    await db.aiUsageLog.create({
      data,
    })
  } catch (error) {
    // Don't throw - logging failures shouldn't break AI features
    console.error('Failed to log AI usage:', error)
  }
}

interface LogActivityParams {
  userId: string
  action: string
  entity: string
  entityId: string
  metadata?: any
}

/**
 * Logs user activity for audit trail
 * @param params - Activity parameters
 */
export async function logActivity({ userId, action, entity, entityId, metadata }: LogActivityParams) {
  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata || {},
      },
    })
  } catch (error) {
    // Don't throw - logging failures shouldn't break features
    console.error('Failed to log activity:', error)
  }
}

/**
 * Gets a default user ID for AI usage logging
 * In a real app, this would come from the session
 */
export function getDefaultUserId(): string | undefined {
  // For now, return undefined. In production, this would come from the authenticated session
  return undefined
}
