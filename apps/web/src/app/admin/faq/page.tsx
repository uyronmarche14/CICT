'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { faqAPI } from '@/lib/api/faq';
import { FAQContent } from '@/types';
import { FAQEditor } from '@/components/admin/FAQEditor';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { appToast } from '@/lib/app-toast';
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



  const loadFAQ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await faqAPI.get();
      setForm(data);
      setInitialForm(JSON.stringify({ title: data.title, subtitle: data.subtitle, topics: data.topics, questions: data.questions }));
    } catch {
      appToast.error('Load Failed', 'Could not load FAQ data.', { label: 'Retry', onClick: loadFAQ });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFAQ();
  }, [loadFAQ]);

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
      appToast.error('Validation Errors', 'Please fix the form errors before saving.');
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const updated = await faqAPI.update(form);
      setForm(updated);
      setInitialForm(JSON.stringify({ title: updated.title, subtitle: updated.subtitle, topics: updated.topics, questions: updated.questions }));
      setErrors({});
      appToast.success('FAQ Updated', 'FAQ content has been saved successfully.');
    } catch {
      appToast.error('Save Failed', 'Could not save FAQ content.', { label: 'Retry', onClick: handleSave });
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
      appToast.error('No Topics', 'Create at least one topic before adding questions.');
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

  return (
    <FAQEditor
      form={form}
      errors={errors as Record<string, unknown>}
      topicOptions={topicOptions}
      isDirty={isDirty}
      saving={saving}
      loading={loading}
      activeTopicFilter={activeTopicFilter}
      onFormChange={(updates) => setForm((f) => ({ ...f, ...updates }))}
      onSave={handleSave}
      onAddTopic={() => setForm((f) => ({ ...f, topics: [...f.topics, createEmptyTopic(f.topics.length)] }))}
      onUpdateTopic={updateTopic}
      onMoveTopic={moveTopic}
      onRemoveTopic={removeTopic}
      onAddQuestion={addQuestion}
      onUpdateQuestion={updateQuestion}
      onMoveQuestion={moveQuestion}
      onRemoveQuestion={removeQuestion}
      onTopicFilterChange={setActiveTopicFilter}
    />
  );
}
