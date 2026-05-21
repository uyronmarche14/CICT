'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2, Plus, Save, Trash2, ChevronUp, ChevronDown,
  FileQuestion, Hash, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqAPI } from '@/lib/api/faq';
import { FAQContent } from '@/types';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { toast } from 'sonner';
import FAQSectionContent from '@/components/sections/landingpage/FAQSectionContent';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';

const createEmptyTopic = (index: number) => ({
  id: `topic-${index + 1}`,
  label: '',
});

const createEmptyQuestion = (category: string) => ({
  category,
  question: '',
  answer: '',
});

const normalizeTopicId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface ValidationErrors {
  title?: string;
  subtitle?: string;
  topics?: Record<number, { id?: string; label?: string }>;
  questions?: Record<number, { category?: string; question?: string; answer?: string }>;
  global?: string;
}

export default function FAQAdminPage() {
  const { canManageSettings } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canManageSettings());
  const [form, setForm] = useState<FAQContent>({
    title: '',
    subtitle: '',
    topics: [],
    questions: [],
  });
  const [initialForm, setInitialForm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [activeTopicFilter, setActiveTopicFilter] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const isValidTopic = useCallback(
    (topicId: string) => form.topics.some((t) => t.id.trim() === topicId && t.label.trim()),
    [form.topics]
  );

  const topicOptions = useMemo(
    () => form.topics.filter((topic) => topic.id.trim() && topic.label.trim()),
    [form.topics]
  );

  const isDirty = useMemo(
    () => initialForm !== JSON.stringify({ title: form.title, subtitle: form.subtitle, topics: form.topics, questions: form.questions }),
    [initialForm, form.title, form.subtitle, form.topics, form.questions]
  );



  useEffect(() => {
    const loadFAQ = async () => {
      setLoading(true);
      try {
        const data = await faqAPI.get();
        setForm(data);
        setInitialForm(JSON.stringify({ title: data.title, subtitle: data.subtitle, topics: data.topics, questions: data.questions }));
      } catch {
        toast.error('Failed to load FAQ content');
      } finally {
        setLoading(false);
      }
    };
    loadFAQ();
  }, []);

  const validate = useCallback((): boolean => {
    const errs: ValidationErrors = {};
    let valid = true;

    if (!form.title.trim()) {
      errs.title = 'Title is required';
      valid = false;
    }
    if (!form.subtitle.trim()) {
      errs.subtitle = 'Subtitle is required';
      valid = false;
    }

    const topicIds = form.topics.map((topic) => topic.id.trim()).filter(Boolean);
    const duplicateTopicIds = topicIds.filter((tid, i) => topicIds.indexOf(tid) !== i);

    const topicErrors: Record<number, { id?: string; label?: string }> = {};
    form.topics.forEach((topic, i) => {
      if (!topic.id.trim()) {
        topicErrors[i] = { ...topicErrors[i], id: 'Topic ID is required' };
        valid = false;
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.id.trim())) {
        topicErrors[i] = { ...topicErrors[i], id: 'Must be a lowercase slug (e.g. my-topic)' };
        valid = false;
      } else if (duplicateTopicIds.includes(topic.id.trim())) {
        topicErrors[i] = { ...topicErrors[i], id: 'Duplicate topic ID' };
        valid = false;
      }
      if (!topic.label.trim()) {
        topicErrors[i] = { ...topicErrors[i], label: 'Topic label is required' };
        valid = false;
      }
    });
    if (form.topics.length === 0) {
      errs.global = 'Add at least one topic';
      valid = false;
    }
    if (Object.keys(topicErrors).length > 0) errs.topics = topicErrors;

    const questionErrors: Record<number, { category?: string; question?: string; answer?: string }> = {};
    form.questions.forEach((q, i) => {
      if (!q.category.trim() || !isValidTopic(q.category.trim())) {
        questionErrors[i] = { ...questionErrors[i], category: 'Must match an existing topic' };
        valid = false;
      }
      if (!q.question.trim()) {
        questionErrors[i] = { ...questionErrors[i], question: 'Question is required' };
        valid = false;
      }
      if (!q.answer.trim()) {
        questionErrors[i] = { ...questionErrors[i], answer: 'Answer is required' };
        valid = false;
      }
    });
    if (form.questions.length === 0) {
      errs.global = errs.global ? `${errs.global}. Add at least one question` : 'Add at least one question';
      valid = false;
    }
    if (Object.keys(questionErrors).length > 0) errs.questions = questionErrors;

    setErrors(errs);
    return valid;
  }, [form, isValidTopic]);

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the validation errors before saving');
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const updated = await faqAPI.update(form);
      setForm(updated);
      setInitialForm(JSON.stringify({ title: updated.title, subtitle: updated.subtitle, topics: updated.topics, questions: updated.questions }));
      setErrors({});
      toast.success('FAQ content updated');
    } catch {
      toast.error('Failed to update FAQ content');
    } finally {
      setSaving(false);
    }
  };

  const updateTopic = (index: number, field: 'id' | 'label', value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (next.topics) {
        const updated = { ...next.topics };
        delete updated[index];
        next.topics = Object.keys(updated).length > 0 ? updated : undefined;
      }
      return next;
    });
    setForm((current) => ({
      ...current,
      topics: current.topics.map((topic, topicIndex) =>
        topicIndex === index
          ? { ...topic, [field]: field === 'id' ? normalizeTopicId(value) : value }
          : topic
      ),
      questions:
        field === 'id'
          ? current.questions.map((question) =>
              question.category === current.topics[index]?.id
                ? { ...question, category: normalizeTopicId(value) }
                : question
            )
          : current.questions,
    }));
  };

  const moveTopic = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= form.topics.length) return;
    setForm((current) => {
      const topics = [...current.topics];
      [topics[index], topics[target]] = [topics[target], topics[index]];
      return { ...current, topics };
    });
  };

  const removeTopic = (index: number) => {
    setForm((current) => {
      const removedTopic = current.topics[index];
      const nextTopics = current.topics.filter((_, topicIndex) => topicIndex !== index);
      const fallbackCategory = nextTopics[0]?.id ?? '';
      return {
        ...current,
        topics: nextTopics,
        questions: current.questions.map((question) =>
          question.category === removedTopic?.id
            ? { ...question, category: fallbackCategory }
            : question
        ),
      };
    });
  };

  const addQuestion = (category: string) => {
    const catId = category || form.topics[0]?.id || '';
    if (!catId) {
      toast.error('Create a topic first');
      return;
    }
    setForm((current) => ({
      ...current,
      questions: [...current.questions, createEmptyQuestion(catId)],
    }));
  };

  const updateQuestion = (index: number, field: 'category' | 'question' | 'answer', value: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (next.questions) {
        const updated = { ...next.questions };
        delete updated[index];
        next.questions = Object.keys(updated).length > 0 ? updated : undefined;
      }
      return next;
    });
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question
      ),
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= form.questions.length) return;
    setForm((current) => {
      const questions = [...current.questions];
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return { ...current, questions };
    });
  };

  if (!shouldRender) return null;

  if (!canManageSettings()) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground">You do not have access to manage shared site FAQ content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={formRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground">Manage the public landing-page FAQ section.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="flex items-center gap-1.5 text-sm text-amber-500">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </span>
          )}
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save FAQ
          </Button>
        </div>
      </div>

      {errors.global && (
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errors.global}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  Header
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => {
                      setErrors((prev) => ({ ...prev, title: undefined }));
                      setForm((current) => ({ ...current, title: e.target.value }));
                    }}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle</label>
                  <Textarea
                    rows={3}
                    value={form.subtitle}
                    onChange={(e) => {
                      setErrors((prev) => ({ ...prev, subtitle: undefined }));
                      setForm((current) => ({ ...current, subtitle: e.target.value }));
                    }}
                    className={errors.subtitle ? 'border-red-500' : ''}
                  />
                  {errors.subtitle && (
                    <p className="text-xs text-red-500">{errors.subtitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  Topics
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {form.topics.length}
                  </Badge>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      topics: [...current.topics, createEmptyTopic(current.topics.length)],
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add topic
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.topics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileQuestion className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No topics yet. Add one to group your FAQ.</p>
                  </div>
                ) : (
                  form.topics.map((topic, index) => (
                    <div
                      key={`${topic.id}-${index}`}
                      className="flex items-start gap-2 rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-0.5 pt-1">
                        <button
                          type="button"
                          onClick={() => moveTopic(index, 'up')}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTopic(index, 'down')}
                          disabled={index === form.topics.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="topic-id (slug)"
                            value={topic.id}
                            onChange={(e) => updateTopic(index, 'id', e.target.value)}
                            className={errors.topics?.[index]?.id ? 'border-red-500' : ''}
                          />
                          {errors.topics?.[index]?.id && (
                            <p className="text-xs text-red-500">{errors.topics[index].id}</p>
                          )}
                        </div>
                        <div className="flex-[2] space-y-1">
                          <Input
                            placeholder="Topic label (e.g. Admission & Enrollment)"
                            value={topic.label}
                            onChange={(e) => updateTopic(index, 'label', e.target.value)}
                            className={errors.topics?.[index]?.label ? 'border-red-500' : ''}
                          />
                          {errors.topics?.[index]?.label && (
                            <p className="text-xs text-red-500">{errors.topics[index].label}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeTopic(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-muted-foreground" />
                  Questions
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {form.questions.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {topicOptions.length > 0 && (
                    <Select
                      value={activeTopicFilter ?? ''}
                      onValueChange={(val) => setActiveTopicFilter(val || null)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-topics">All topics</SelectItem>
                        {topicOptions.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={topicOptions.length === 0}
                    onClick={() => addQuestion(topicOptions[0]?.id ?? '')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileQuestion className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No questions yet. Add one to populate the FAQ.
                    </p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {topicOptions
                      .filter((t) => !activeTopicFilter || t.id === activeTopicFilter)
                      .map((topic) => {
                        const topicQuestions = form.questions
                          .map((q, i) => ({ ...q, originalIndex: i }))
                          .filter((q) => q.category === topic.id);

                        if (topicQuestions.length === 0) return null;

                        return (
                          <AccordionItem
                            key={topic.id}
                            value={topic.id}
                            className="mb-2 rounded-lg border border-border"
                          >
                            <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span>{topic.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {topicQuestions.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 pt-2">
                              <div className="space-y-3">
                                {topicQuestions.map(({ originalIndex, ...entry }) => (
                                  <div
                                    key={`q-${originalIndex}`}
                                    className="space-y-2 rounded-lg border p-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={entry.category}
                                        onValueChange={(value) =>
                                          updateQuestion(originalIndex, 'category', value)
                                        }
                                      >
                                        <SelectTrigger
                                          className={`w-full ${
                                            errors.questions?.[originalIndex]?.category
                                              ? 'border-red-500'
                                              : ''
                                          }`}
                                        >
                                          <SelectValue placeholder="Topic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {topicOptions.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                              {t.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => moveQuestion(originalIndex, 'up')}
                                          disabled={originalIndex === 0}
                                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                        >
                                          <ChevronUp className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => moveQuestion(originalIndex, 'down')}
                                          disabled={originalIndex === form.questions.length - 1}
                                          className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                        >
                                          <ChevronDown className="h-3 w-3" />
                                        </button>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() => removeQuestion(originalIndex)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                    <div className="space-y-1">
                                      <Input
                                        placeholder="Question"
                                        value={entry.question}
                                        onChange={(e) =>
                                          updateQuestion(originalIndex, 'question', e.target.value)
                                        }
                                        className={
                                          errors.questions?.[originalIndex]?.question
                                            ? 'border-red-500'
                                            : ''
                                        }
                                      />
                                      {errors.questions?.[originalIndex]?.question && (
                                        <p className="text-xs text-red-500">
                                          {errors.questions[originalIndex].question}
                                        </p>
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <Textarea
                                        rows={3}
                                        placeholder="Answer"
                                        value={entry.answer}
                                        onChange={(e) =>
                                          updateQuestion(originalIndex, 'answer', e.target.value)
                                        }
                                        className={
                                          errors.questions?.[originalIndex]?.answer
                                            ? 'border-red-500'
                                            : ''
                                        }
                                      />
                                      {errors.questions?.[originalIndex]?.answer && (
                                        <p className="text-xs text-red-500">
                                          {errors.questions[originalIndex].answer}
                                        </p>
                                      )}
                                    </div>
                                    {errors.questions?.[originalIndex]?.category && (
                                      <p className="text-xs text-red-500">
                                        {errors.questions[originalIndex].category}
                                      </p>
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
          </div>

          <div className="xl:sticky xl:top-8 xl:self-start">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[70vh] overflow-y-auto p-0">
                <FAQSectionContent data={form} previewLabel="Admin preview" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
