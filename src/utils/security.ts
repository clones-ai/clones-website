/**
 * Security Monitoring Utilities
 * 
 * Monitors authentication security events and provides debugging tools
 */

export interface SecurityEvent {
    type: 'auth_success' | 'auth_failure' | 'csrf_mismatch' | 'session_expired' | 'suspicious_activity';
    message: string;
    timestamp: number;
    context?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityMonitor {
    private static instance: SecurityMonitor;
    private events: SecurityEvent[] = [];
    private maxEvents = 100;

    static getInstance(): SecurityMonitor {
        if (!SecurityMonitor.instance) {
            SecurityMonitor.instance = new SecurityMonitor();
        }
        return SecurityMonitor.instance;
    }

    /**
     * Log a security event
     */
    logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
        const fullEvent: SecurityEvent = {
            ...event,
            timestamp: Date.now()
        };

        this.events.unshift(fullEvent);

        // Keep only the latest events
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(0, this.maxEvents);
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            const severity = fullEvent.severity.toUpperCase();
            const style = this.getSeverityStyle(fullEvent.severity);

            console.log(
                `%c[SECURITY ${severity}] ${fullEvent.message}`,
                style,
                fullEvent.context || ''
            );
        }

        // Alert on critical events
        if (fullEvent.severity === 'critical') {
            this.handleCriticalEvent(fullEvent);
        }
    }

    /**
     * Get console styling for different severity levels
     */
    private getSeverityStyle(severity: SecurityEvent['severity']): string {
        switch (severity) {
            case 'critical':
                return 'color: white; background-color: red; font-weight: bold; padding: 2px 4px;';
            case 'high':
                return 'color: red; font-weight: bold;';
            case 'medium':
                return 'color: orange; font-weight: bold;';
            case 'low':
                return 'color: blue;';
            default:
                return '';
        }
    }

    /**
     * Handle critical security events
     */
    private handleCriticalEvent(event: SecurityEvent): void {
        // In production, this could send alerts to monitoring service
        if (import.meta.env.PROD) {
            // Example: Send to monitoring service
            // this.sendToMonitoringService(event);
        }

        // Store in localStorage for debugging
        try {
            const criticalEvents = JSON.parse(localStorage.getItem('security_critical_events') || '[]');
            criticalEvents.unshift(event);
            localStorage.setItem('security_critical_events', JSON.stringify(criticalEvents.slice(0, 10)));
        } catch (error) {
            console.warn('Failed to store critical security event:', error);
        }
    }

    /**
     * Get recent security events
     */
    getEvents(limit = 20): SecurityEvent[] {
        return this.events.slice(0, limit);
    }

    /**
     * Get events by severity
     */
    getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
        return this.events.filter(event => event.severity === severity);
    }

    /**
     * Clear all events
     */
    clearEvents(): void {
        this.events = [];
    }

    /**
     * Get security statistics
     */
    getStats(): {
        total: number;
        by_severity: Record<SecurityEvent['severity'], number>;
        by_type: Record<SecurityEvent['type'], number>;
        recent_activity: boolean;
    } {
        const stats = {
            total: this.events.length,
            by_severity: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0
            },
            by_type: {
                auth_success: 0,
                auth_failure: 0,
                csrf_mismatch: 0,
                session_expired: 0,
                suspicious_activity: 0
            },
            recent_activity: false
        };

        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

        this.events.forEach(event => {
            stats.by_severity[event.severity]++;
            stats.by_type[event.type]++;

            if (event.timestamp > fiveMinutesAgo) {
                stats.recent_activity = true;
            }
        });

        return stats;
    }

    /**
     * Export events for analysis
     */
    exportEvents(): string {
        return JSON.stringify(this.events, null, 2);
    }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();

/**
 * Helper functions for common security events
 */
export const SecurityEvents = {
    authSuccess: (context?: Record<string, any>) => {
        securityMonitor.logEvent({
            type: 'auth_success',
            message: 'Authentication successful',
            severity: 'low',
            context
        });
    },

    authFailure: (reason: string, context?: Record<string, any>) => {
        securityMonitor.logEvent({
            type: 'auth_failure',
            message: `Authentication failed: ${reason}`,
            severity: 'medium',
            context
        });
    },

    csrfMismatch: (context?: Record<string, any>) => {
        securityMonitor.logEvent({
            type: 'csrf_mismatch',
            message: 'CSRF token mismatch detected',
            severity: 'high',
            context
        });
    },

    sessionExpired: (context?: Record<string, any>) => {
        securityMonitor.logEvent({
            type: 'session_expired',
            message: 'Session expired',
            severity: 'medium',
            context
        });
    },

    suspiciousActivity: (description: string, context?: Record<string, any>) => {
        securityMonitor.logEvent({
            type: 'suspicious_activity',
            message: `Suspicious activity: ${description}`,
            severity: 'critical',
            context
        });
    }
};
