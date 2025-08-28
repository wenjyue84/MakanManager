"use client";

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Star,
  Zap,
  Target,
  Activity,
  Award,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Task, User as UserType } from '../../lib/types';
import { users } from '../../lib/data';
import { 
  AssignmentSuggestion, 
  assignmentSuggestionsService 
} from '../../lib/services/assignment-suggestions.service';

interface AssignmentSuggestionsPanelProps {
  task: Task;
  onAssign: (userId: string) => void;
  className?: string;
}

export function AssignmentSuggestionsPanel({ 
  task, 
  onAssign, 
  className 
}: AssignmentSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<AssignmentSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const availableUsers = users.filter(user => user.id !== task.assignerId);
      const taskSuggestions = await assignmentSuggestionsService.getSuggestionsForTask(
        task, 
        availableUsers
      );
      setSuggestions(taskSuggestions.slice(0, 5)); // Show top 5 suggestions
    } catch (err) {
      setError('Failed to load assignment suggestions');
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [task.id]);

  const getUserById = (id: string) => users.find(user => user.id === id);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getWorkloadImpactColor = (impact: string) => {
    switch (impact) {
      case 'minimal': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'significant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 120) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            Smart Assignment Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="size-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Analyzing team capacity...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            Smart Assignment Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadSuggestions} className="mt-4" variant="outline">
            <RefreshCw className="size-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            Smart Assignment Suggestions
          </CardTitle>
          <Button onClick={loadSuggestions} variant="ghost" size="sm">
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <User className="size-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No suitable candidates found</p>
          </div>
        ) : (
          <>
            {/* Top recommendation highlight */}
            {suggestions.length > 0 && suggestions[0].confidence === 'high' && (
              <Alert>
                <Zap className="size-4" />
                <AlertDescription>
                  <strong>{getUserById(suggestions[0].userId)?.name}</strong> is the optimal choice 
                  with a confidence score of {suggestions[0].score}/150
                </AlertDescription>
              </Alert>
            )}

            {/* Suggestion list */}
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => {
                const user = getUserById(suggestion.userId);
                if (!user) return null;

                const isTopChoice = index === 0 && suggestion.confidence === 'high';

                return (
                  <Card 
                    key={user.id} 
                    className={`transition-all hover:shadow-md ${
                      isTopChoice ? 'ring-2 ring-primary/20 border-primary/30' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* User header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.photo} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.name}
                                {isTopChoice && (
                                  <Badge className="text-xs">
                                    <Award className="size-3 mr-1" />
                                    Top Choice
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {user.station || 'Any Station'}
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={() => onAssign(user.id)}
                            size="sm"
                            variant={isTopChoice ? "default" : "outline"}
                          >
                            Assign
                          </Button>
                        </div>

                        {/* Score and metrics */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="size-4" />
                            <span className="font-medium">Score:</span>
                            <span className={`font-bold ${getScoreColor(suggestion.score)}`}>
                              {suggestion.score}/150
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Activity className="size-4" />
                            <span>Confidence:</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                            >
                              {suggestion.confidence}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="size-4" />
                            <span>ETA:</span>
                            <span className="font-medium">{suggestion.estimatedCompletionTime}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Match Score</span>
                            <span>{Math.round((suggestion.score / 150) * 100)}%</span>
                          </div>
                          <Progress value={(suggestion.score / 150) * 100} className="h-2" />
                        </div>

                        {/* Workload impact */}
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="size-4" />
                          <span>Workload Impact:</span>
                          <span className={`font-medium capitalize ${getWorkloadImpactColor(suggestion.workloadImpact)}`}>
                            {suggestion.workloadImpact}
                          </span>
                        </div>

                        {/* Reasons */}
                        {suggestion.reasons.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <div className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="size-4" />
                                Why this assignment makes sense:
                              </div>
                              <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                                {suggestion.reasons.map((reason, reasonIndex) => (
                                  <li key={reasonIndex} className="flex items-start gap-1">
                                    <span className="block w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Footer info */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Suggestions based on workload, skills, performance, and station compatibility
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}