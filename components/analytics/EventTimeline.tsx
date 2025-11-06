/**
 * EventTimeline Component
 * Displays a timeline of analytics events
 */

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AnalyticsEvent, analyticsService } from '../../lib/services/analyticsService';

export interface EventTimelineProps {
  projectId: string;
  isDarkMode?: boolean;
  limit?: number;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'task_completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'task_created':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
};

const getEventColor = (eventType: string, isDarkMode: boolean) => {
  const baseClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  switch (eventType) {
    case 'task_completed':
      return `${baseClass} border-l-4 border-l-green-500`;
    case 'task_created':
      return `${baseClass} border-l-4 border-l-blue-500`;
    case 'error':
      return `${baseClass} border-l-4 border-l-red-500`;
    default:
      return `${baseClass} border-l-4 border-l-gray-500`;
  }
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  projectId,
  isDarkMode = false,
  limit = 10
}) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [projectId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getEvents(projectId, limit);
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const labelClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (loading) {
    return (
      <div className={`${bgClass} rounded-lg p-6`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${bgClass} rounded-lg p-6`}>
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} rounded-lg p-6`}>
      <h3 className={`${textClass} text-lg font-semibold mb-6`}>
        Recent Events
      </h3>

      {events.length === 0 ? (
        <div className={`${labelClass} text-center py-8`}>
          No events recorded yet
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`
                ${getEventColor(event.event_type, isDarkMode)}
                rounded-lg border p-4
                transition-all duration-200 hover:shadow-md
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.event_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`${textClass} font-medium capitalize`}>
                        {event.event_type.replace(/_/g, ' ')}
                      </p>
                      <p className={`${labelClass} text-sm mt-1`}>
                        {event.metric_name}: {event.metric_value}
                      </p>
                    </div>
                    <span className={`${labelClass} text-xs whitespace-nowrap`}>
                      {formatDate(event.created_at)}
                    </span>
                  </div>

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className={`${labelClass} text-xs mt-2 space-y-1`}>
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more button */}
      {events.length >= limit && (
        <button
          type="button"
          onClick={loadEvents}
          className={`
            mt-6 w-full py-2 px-4 rounded-lg
            ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}
            transition-colors duration-200 font-medium
          `}
        >
          Load More Events
        </button>
      )}
    </div>
  );
};

export default EventTimeline;

