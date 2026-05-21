'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PublicSectionHeader from '@/components/sections/landingpage/PublicSectionHeader';
import { FAQContent } from '@/types';

interface FAQSectionContentProps {
  data: FAQContent;
  previewLabel?: string;
}

const FAQSectionContent = ({ data, previewLabel }: FAQSectionContentProps) => {
  const { title, subtitle, topics, questions } = data;
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuestions = useMemo(() => {
    let result = questions;
    if (activeTopic) {
      result = result.filter((q) => q.category === activeTopic);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query)
      );
    }
    return result;
  }, [questions, activeTopic, searchQuery]);

  const groupedQuestions = useMemo(() => {
    const grouped: Record<string, typeof questions> = {};
    for (const q of filteredQuestions) {
      if (!grouped[q.category]) grouped[q.category] = [];
      grouped[q.category].push(q);
    }
    return grouped;
  }, [filteredQuestions]);

  const topicMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const topic of topics) {
      map[topic.id] = topic.label;
    }
    return map;
  }, [topics]);

  const questionCountByTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of questions) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    return counts;
  }, [questions]);

  const handleTopicClick = (topicId: string | null) => {
    setActiveTopic((prev) => (prev === topicId ? null : topicId));
  };

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <PublicSectionHeader
            eyebrow={previewLabel ?? 'FAQ'}
            title={title}
            description={subtitle}
          />
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Topics</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleTopicClick(null)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeTopic === null
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <span>All</span>
                  <span className="text-xs opacity-70">{questions.length}</span>
                </button>
                {topics
                  .filter((t) => t.id.trim() && t.label.trim())
                  .map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                        activeTopic === topic.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {topic.label}
                      </span>
                      <Badge
                        variant={activeTopic === topic.id ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {questionCountByTopic[topic.id] ?? 0}
                      </Badge>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <HelpCircle className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-foreground">No questions found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or topic filter.
                </p>
              </div>
            ) : (
              <motion.div
                key={activeTopic ?? 'all'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
                  <div key={category} className="mb-6">
                    {!activeTopic && (
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant="secondary" className="pointer-events-none">
                          {topicMap[category] ?? category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {categoryQuestions.length} {categoryQuestions.length === 1 ? 'question' : 'questions'}
                        </span>
                      </div>
                    )}
                    <Accordion type="single" collapsible className="w-full">
                      {categoryQuestions.map((faq, index) => (
                        <motion.div
                          key={`${faq.category}-${index}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                        >
                          <AccordionItem
                            value={`${faq.category}-${index}`}
                            className="group mb-2 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30 data-[state=open]:border-primary/40"
                          >
                            <AccordionTrigger className="px-5 py-4 text-left font-medium text-foreground transition-colors hover:no-underline hover:bg-muted/30 data-[state=open]:bg-primary/5">
                              <div className="flex items-start gap-3">
                                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                <span className="text-base leading-relaxed">{faq.question}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="border-t border-border/50 px-5 py-4">
                              <div className="pl-7">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {faq.answer}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSectionContent;
