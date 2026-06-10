'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus, Trash2, ChevronUp, ChevronDown, FileQuestion, Hash } from 'lucide-react';
import type { FAQTopic, FAQEntry } from '@/types';

interface FaqListProps {
  topics: FAQTopic[];
  questions: FAQEntry[];
  topicOptions: Array<{ id: string; label: string }>;
  activeTopicFilter: string | null;
  topicErrors?: Record<number, { id?: string; label?: string }>;
  questionErrors?: Record<number, { category?: string; question?: string; answer?: string }>;
  onAddTopic: () => void;
  onUpdateTopic: (index: number, field: 'id' | 'label', value: string) => void;
  onMoveTopic: (index: number, direction: 'up' | 'down') => void;
  onRemoveTopic: (index: number) => void;
  onAddQuestion: (category: string) => void;
  onUpdateQuestion: (index: number, field: 'category' | 'question' | 'answer', value: string) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
  onRemoveQuestion: (index: number) => void;
  onTopicFilterChange: (value: string | null) => void;
}

export function FaqList({
  topics,
  questions,
  topicOptions,
  activeTopicFilter,
  topicErrors,
  questionErrors,
  onAddTopic,
  onUpdateTopic,
  onMoveTopic,
  onRemoveTopic,
  onAddQuestion,
  onUpdateQuestion,
  onMoveQuestion,
  onRemoveQuestion,
  onTopicFilterChange,
}: FaqListProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" /> Topics{' '}
            <Badge variant="secondary" className="ml-2 text-xs">{topics.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onAddTopic}>
            <Plus className="w-4 h-4 mr-1" /> Add topic
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {topics.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <FileQuestion className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No topics yet
            </div>
          ) : (
            topics.map((topic, i) => (
              <div key={`${topic.id}-${i}`} className="flex items-start gap-2 p-3 border rounded-lg">
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" onClick={() => onMoveTopic(i, 'up')} disabled={i === 0}>
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onMoveTopic(i, 'down')} disabled={i === topics.length - 1}>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={topic.id}
                      onChange={(e) => onUpdateTopic(i, 'id', e.target.value)}
                      placeholder="topic-id (slug)"
                      className={topicErrors?.[i]?.id ? 'border-red-500' : ''}
                    />
                    {topicErrors?.[i]?.id && <p className="text-xs text-red-500">{topicErrors[i].id}</p>}
                  </div>
                  <div className="flex-[2] space-y-1">
                    <Input
                      value={topic.label}
                      onChange={(e) => onUpdateTopic(i, 'label', e.target.value)}
                      placeholder="Topic label"
                      className={topicErrors?.[i]?.label ? 'border-red-500' : ''}
                    />
                    {topicErrors?.[i]?.label && <p className="text-xs text-red-500">{topicErrors[i].label}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onRemoveTopic(i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-muted-foreground" /> Questions{' '}
            <Badge variant="secondary" className="ml-2 text-xs">{questions.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {topicOptions.length > 0 && (
              <Select
                value={activeTopicFilter ?? 'all-topics'}
                onValueChange={(v) => onTopicFilterChange(v === 'all-topics' ? null : v)}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Filter by topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-topics">All topics</SelectItem>
                  {topicOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddQuestion(topicOptions[0]?.id ?? '')}
              disabled={!topicOptions.length}
            >
              <Plus className="w-4 h-4 mr-1" /> Add question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileQuestion className="w-8 h-8 mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No questions yet.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {topicOptions
                .filter((t) => !activeTopicFilter || t.id === activeTopicFilter)
                .map((topic) => {
                  const topicQuestions = questions
                    .map((q, i) => ({ ...q, originalIndex: i }))
                    .filter((q) => q.category === topic.id);
                  if (topicQuestions.length === 0) return null;
                  return (
                    <AccordionItem key={topic.id} value={topic.id} className="mb-2 rounded-lg border border-border">
                      <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span>{topic.label}</span>
                          <Badge variant="secondary" className="text-xs">{topicQuestions.length}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-2">
                        <div className="space-y-3">
                          {topicQuestions.map(({ originalIndex, ...entry }) => (
                            <div key={`q-${originalIndex}`} className="space-y-2 rounded-lg border p-3">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={entry.category}
                                  onValueChange={(v) => onUpdateQuestion(originalIndex, 'category', v)}
                                >
                                  <SelectTrigger className={`w-full ${questionErrors?.[originalIndex]?.category ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Topic" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {topicOptions.map((t) => (
                                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex items-center gap-0.5">
                                  <Button variant="ghost" size="icon" onClick={() => onMoveQuestion(originalIndex, 'up')} disabled={originalIndex === 0}>
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => onMoveQuestion(originalIndex, 'down')} disabled={originalIndex === questions.length - 1}>
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onRemoveQuestion(originalIndex)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-1">
                                <Input
                                  placeholder="Question"
                                  value={entry.question}
                                  onChange={(e) => onUpdateQuestion(originalIndex, 'question', e.target.value)}
                                  className={questionErrors?.[originalIndex]?.question ? 'border-red-500' : ''}
                                />
                                {questionErrors?.[originalIndex]?.question && (
                                  <p className="text-xs text-red-500">{questionErrors[originalIndex].question}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <Textarea
                                  placeholder="Answer"
                                  value={entry.answer}
                                  rows={3}
                                  onChange={(e) => onUpdateQuestion(originalIndex, 'answer', e.target.value)}
                                  className={questionErrors?.[originalIndex]?.answer ? 'border-red-500' : ''}
                                />
                                {questionErrors?.[originalIndex]?.answer && (
                                  <p className="text-xs text-red-500">{questionErrors[originalIndex].answer}</p>
                                )}
                              </div>
                              {questionErrors?.[originalIndex]?.category && (
                                <p className="text-xs text-red-500">{questionErrors[originalIndex].category}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </>
  );
}
