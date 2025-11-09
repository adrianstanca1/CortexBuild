import React from 'react';

const recipes = [
  {
    title: 'Procurement assistant',
    description: 'Auto-generate purchase orders from budget deltas and send to vendors.'
  },
  {
    title: 'Schedule risk scanner',
    description: 'Analyze tasks with AI to detect likely delays and post to team channel.'
  },
  {
    title: 'Safety briefing bot',
    description: 'Summarize incidents + weather + crew roster into mobile-ready briefing.'
  }
];

export const AutomationStudioPage: React.FC = () => {
  return (
    <div>
      <h1>Automation Studio</h1>
      <p>Deploy ready-made construction agents or build custom flows.</p>
      <div className="cards">
        {recipes.map((recipe) => (
          <article key={recipe.title}>
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <button>Configure</button>
          </article>
        ))}
      </div>
    </div>
  );
};
