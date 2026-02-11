import api from '../lib/api';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';

export interface AuditLogData {
  action: AuditAction;
  entityType: string;
  entityId?: number | null;
  changes?: any;
}

/**
 * Log an action to the audit log
 * @param data - Audit log data
 */
export async function logAuditAction(data: AuditLogData): Promise<void> {
  try {
    await api.post('/audit-logs', data);
  } catch (error) {
    // Silently fail audit logging to not disrupt user experience
    console.error('Failed to log audit action:', error);
  }
}

/**
 * Helper function to log CREATE actions
 */
export async function logCreate(entityType: string, entityId?: number, changes?: any): Promise<void> {
  await logAuditAction({
    action: 'CREATE',
    entityType,
    entityId,
    changes,
  });
}

/**
 * Helper function to log UPDATE actions
 */
export async function logUpdate(entityType: string, entityId?: number, changes?: any): Promise<void> {
  await logAuditAction({
    action: 'UPDATE',
    entityType,
    entityId,
    changes,
  });
}

/**
 * Helper function to log DELETE actions
 */
export async function logDelete(entityType: string, entityId?: number, changes?: any): Promise<void> {
  await logAuditAction({
    action: 'DELETE',
    entityType,
    entityId,
    changes,
  });
}

/**
 * Helper function to log VIEW actions
 */
export async function logView(entityType: string, entityId?: number): Promise<void> {
  await logAuditAction({
    action: 'VIEW',
    entityType,
    entityId,
  });
}

/**
 * Helper function to log EXPORT actions
 */
export async function logExport(entityType: string, filters?: any): Promise<void> {
  await logAuditAction({
    action: 'EXPORT',
    entityType,
    changes: filters,
  });
}

