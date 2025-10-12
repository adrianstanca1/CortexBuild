/**
 * SectionGrid Component
 * Reusable section grid component for dashboard sections
 */

import React, { useMemo } from 'react';
import { SectionGridProps } from '../types/dashboardTypes';
import { getColorClasses, getStaggerDelay } from '../utils/dashboardUtils';
import { GRID_CONFIGS, SPACING, BORDER_RADIUS, SHADOWS, TRANSITIONS, ANIMATION_CONFIG } from '../config/dashboardConfig';

export const SectionGrid: React.FC<SectionGridProps> = React.memo(({ 
  sections, 
  onSectionClick, 
  columns = 3 
}) => {
  const gridClasses = useMemo(() => {
    const config = GRID_CONFIGS.sections;
    return `grid ${config.mobile} ${config.tablet} ${config.desktop} ${SPACING.grid}`;
  }, []);

  return (
    <div className={gridClasses}>
      {sections.map((section, index) => {
        const colorClasses = getColorClasses(section.color as any);
        
        return (
          <div
            key={section.id}
            className={`${BORDER_RADIUS.card} ${SHADOWS.card} ${SHADOWS.cardHover} ${TRANSITIONS.default} cursor-pointer transform hover:scale-${ANIMATION_CONFIG.hoverScale} bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6`}
            onClick={() => onSectionClick(section.id)}
            style={{
              animation: `fadeIn ${ANIMATION_CONFIG.fadeInDuration}ms ease-in-out ${getStaggerDelay(index)}ms forwards`,
              opacity: 0,
            }}
          >
            {/* Icon & Count */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${BORDER_RADIUS.button} ${colorClasses.bg} flex items-center justify-center`}>
                <section.icon className={`w-6 h-6 ${colorClasses.text}`} />
              </div>
              {section.count !== undefined && (
                <span className={`text-2xl font-bold ${colorClasses.text}`}>
                  {section.count}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2">
              {section.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-400">
              {section.description}
            </p>
          </div>
        );
      })}
    </div>
  );
});

SectionGrid.displayName = 'SectionGrid';

export default SectionGrid;

