import React from 'react';
import { User } from '../types';
import { Card } from './ui/Card';

interface AIAdvisorProps {
  user: User;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ user }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold">AI Advisor</h3>
      <p className="text-sm text-muted-foreground">This component is under construction.</p>
    </Card>
  );
};
