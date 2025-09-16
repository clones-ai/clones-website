import React, { useState, useEffect } from 'react';
import { securityMonitor, SecurityEvent } from '../../utils/security';

/**
 * Security Monitor React Hook
 */
export function useSecurityMonitor() {
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [stats, setStats] = useState(securityMonitor.getStats());

    useEffect(() => {
        const updateEvents = () => {
            setEvents(securityMonitor.getEvents());
            setStats(securityMonitor.getStats());
        };

        // Update every 5 seconds
        const interval = setInterval(updateEvents, 5000);

        // Initial update
        updateEvents();

        return () => clearInterval(interval);
    }, []);

    return {
        events,
        stats,
        logEvent: (event: Omit<SecurityEvent, 'timestamp'>) => {
            securityMonitor.logEvent(event);
            setEvents(securityMonitor.getEvents());
            setStats(securityMonitor.getStats());
        },
        clearEvents: () => {
            securityMonitor.clearEvents();
            setEvents([]);
            setStats(securityMonitor.getStats());
        },
        exportEvents: securityMonitor.exportEvents.bind(securityMonitor)
    };
}

/**
 * Development-only security monitor component
 */
export function SecurityMonitorPanel() {
    const { events, stats, clearEvents, exportEvents } = useSecurityMonitor();
    const [isVisible, setIsVisible] = useState(false);

    if (!import.meta.env.DEV) {
        return null;
    }

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="fixed bottom-4 right-4 bg-red-600 text-white p-2 rounded-full text-xs z-50"
                title="Security Monitor"
            >
                🛡️ {stats.total}
            </button>

            {/* Panel */}
            {isVisible && (
                <div className="fixed bottom-16 right-4 w-80 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">🛡️ Security Monitor</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="bg-gray-800 p-2 rounded text-xs">
                            <div>Total Events: {stats.total}</div>
                            <div>Critical: {stats.by_severity.critical}</div>
                            <div>High: {stats.by_severity.high}</div>
                            <div>Medium: {stats.by_severity.medium}</div>
                            <div>Recent Activity: {stats.recent_activity ? 'Yes' : 'No'}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={clearEvents}
                                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(exportEvents())}
                                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                            >
                                Export
                            </button>
                        </div>

                        {/* Events */}
                        <div className="space-y-1 text-xs">
                            {events.slice(0, 10).map((event, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded ${event.severity === 'critical' ? 'bg-red-900' :
                                        event.severity === 'high' ? 'bg-red-800' :
                                            event.severity === 'medium' ? 'bg-orange-800' :
                                                'bg-gray-800'
                                        }`}
                                >
                                    <div className="font-medium">{event.message}</div>
                                    <div className="text-gray-400">
                                        {new Date(event.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
