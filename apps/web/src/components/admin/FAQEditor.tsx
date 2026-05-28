'use client';

import { useRef } from 'react';
import { Loader2, Plus, Save, Trash2, ChevronUp, ChevronDown, FileQuestion, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQContent } from '@/types';
import FAQSectionContent from '@/components/sections/landingpage/FAQSectionContent';

interface FAQEditorProps {
  form: FAQContent;
  errors: Record<string, unknown>;
  topicOptions: Array<{ id: string; label: string }>;
  isDirty: boolean;
  saving: boolean;
  loading: boolean;
  activeTopicFilter: string | null;
  onFormChange: (updates: Partial<FAQContent>) => void;
  onSave: () => void;
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

export function FAQEditor({
  form, errors, topicOptions, isDirty, saving, loading, activeTopicFilter,
  onFormChange, onSave, onAddTopic, onUpdateTopic, onMoveTopic, onRemoveTopic,
  onAddQuestion, onUpdateQuestion, onMoveQuestion, onRemoveQuestion, onTopicFilterChange,
}: FAQEditorProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const getErr = (key: string): string | undefined => (errors as Record<string, string>)[key];
  const getTopicErr = (i: number, field: string) => {
    const t = (errors as Record<string, unknown>)?.topics as Record<string, Record<string, string>> | undefined;
    return t?.[i]?.[field];
  };
  const getQuestionErr = (i: number, field: string) => {
    const q = (errors as Record<string, unknown>)?.questions as Record<string, Record<string, string>> | undefined;
    return q?.[i]?.[field];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div ref={formRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground">Manage the public landing-page FAQ section.</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && <Badge variant="secondary" className="text-amber-600 border-amber-300 bg-amber-50">Unsaved changes</Badge>}
          <Button onClick={onSave} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {getErr('global') && (
        <div className="border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{getErr('global')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /> Header</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Title</Label>
                <Input value={form.title} onChange={(e) => onFormChange({ title: e.target.value })}
                  className={getErr('title') ? 'border-red-500' : ''} />
                {getErr('title') && <p className="text-xs text-red-500">{getErr('title')}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subtitle</Label>
                <Textarea value={form.subtitle} onChange={(e) => onFormChange({ subtitle: e.target.value })}
                  rows={3} className={getErr('subtitle') ? 'border-red-500' : ''} />
                {getErr('subtitle') && <p className="text-xs text-red-500">{getErr('subtitle')}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" /> Topics <Badge variant="secondary" className="ml-2 text-xs">{form.topics.length}</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={onAddTopic}>
                <Plus className="w-4 h-4 mr-1" /> Add topic
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {form.topics.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <FileQuestion className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No topics yet
                </div>
              ) : (
                form.topics.map((topic, i) => (
                  <div key={`${topic.id}-${i}`} className="flex items-start gap-2 p-3 border rounded-lg">
                    <div className="flex flex-col gap-0.5">
                      <Button variant="ghost" size="icon" onClick={() => onMoveTopic(i, 'up')} disabled={i === 0}>
                        <ChevronUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onMoveTopic(i, 'down')} disabled={i === form.topics.length - 1}>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <div className="flex-1 space-y-1">
                        <Input value={topic.id} onChange={(e) => onUpdateTopic(i, 'id', e.target.value)}
                          placeholder="topic-id (slug)" className={getTopicErr(i, 'id') ? 'border-red-500' : ''} />
                        {getTopicErr(i, 'id') && <p className="text-xs text-red-500">{getTopicErr(i, 'id')}</p>}
                      </div>
                      <div className="flex-[2] space-y-1">
                        <Input value={topic.label} onChange={(e) => onUpdateTopic(i, 'label', e.target.value)}
                          placeholder="Topic label" className={getTopicErr(i, 'label') ? 'border-red-500' : ''} />
                        {getTopicErr(i, 'label') && <p className="text-xs text-red-500">{getTopicErr(i, 'label')}</p>}
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
                <FileQuestion className="w-4 h-4 text-muted-foreground" /> Questions <Badge variant="secondary" className="ml-2 text-xs">{form.questions.length}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                {topicOptions.length > 0 && (
                  <Select value={activeTopicFilter ?? 'all-topics'} onValueChange={(v) => onTopicFilterChange(v === 'all-topics' ? null : v)}>
                    <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Filter by topic" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-topics">All topics</SelectItem>
                      {topicOptions.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={() => onAddQuestion(topicOptions[0]?.id ?? '')} disabled={!topicOptions.length}>
                  <Plus className="w-4 h-4 mr-1" /> Add question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileQuestion className="w-8 h-8 mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No questions yet.</p>
                </div>
              ) : (
                <Accordion type="multiple" className="w-full">
                  {topicOptions.filter((t) => !activeTopicFilter || t.id === activeTopicFilter).map((topic) => {
                    const topicQuestions = form.questions
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
                                  <Select value={entry.category} onValueChange={(v) => onUpdateQuestion(originalIndex, 'category', v)}>
                                    <SelectTrigger className={`w-full ${getQuestionErr(originalIndex, 'category') ? 'border-red-500' : ''}`}>
                                      <SelectValue placeholder="Topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {topicOptions.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <div className="flex items-center gap-0.5">
                                    <Button variant="ghost" size="icon" onClick={() => onMoveQuestion(originalIndex, 'up')} disabled={originalIndex === 0}>
                                      <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => onMoveQuestion(originalIndex, 'down')} disabled={originalIndex === form.questions.length - 1}>
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onRemoveQuestion(originalIndex)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                                <div className="space-y-1">
                                  <Input placeholder="Question" value={entry.question}
                                    onChange={(e) => onUpdateQuestion(originalIndex, 'question', e.target.value)}
                                    className={getQuestionErr(originalIndex, 'question') ? 'border-red-500' : ''} />
                                  {getQuestionErr(originalIndex, 'question') && <p className="text-xs text-red-500">{getQuestionErr(originalIndex, 'question')}</p>}
                                </div>
                                <div className="space-y-1">
                                  <Textarea placeholder="Answer" value={entry.answer} rows={3}
                                    onChange={(e) => onUpdateQuestion(originalIndex, 'answer', e.target.value)}
                                    className={getQuestionErr(originalIndex, 'answer') ? 'border-red-500' : ''} />
                                  {getQuestionErr(originalIndex, 'answer') && <p className="text-xs text-red-500">{getQuestionErr(originalIndex, 'answer')}</p>}
                                </div>
                                {getQuestionErr(originalIndex, 'category') && <p className="text-xs text-red-500">{getQuestionErr(originalIndex, 'category')}</p>}
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
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start lg:col-span-1">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle className="text-base">Live Preview</CardTitle></CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto p-0">
              <FAQSectionContent data={form} previewLabel="Admin preview" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
