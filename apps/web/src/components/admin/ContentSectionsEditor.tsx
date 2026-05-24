'use client';

import { ContentSection } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/admin/DynamicRichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface ContentSectionsEditorProps {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
}

export function ContentSectionsEditor({ sections, onChange }: ContentSectionsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Structured Sections</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...sections,
              { heading: '', style: 'default', bodyHtml: '', items: [] },
            ])
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Add optional callouts, checklists, or supporting sections under the main body.
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={`${section.heading}-${index}`} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Section {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-600"
                onClick={() => onChange(sections.filter((_, sectionIndex) => sectionIndex !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                  value={section.heading}
                  onChange={(event) =>
                    onChange(
                      sections.map((item, sectionIndex) =>
                        sectionIndex === index ? { ...item, heading: event.target.value } : item
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <Select
                  value={section.style}
                  onValueChange={(value: ContentSection['style']) =>
                    onChange(
                      sections.map((item, sectionIndex) =>
                        sectionIndex === index ? { ...item, style: value } : item
                      )
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="callout">Callout</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Section Body</Label>
              <RichTextEditor
                value={section.bodyHtml ?? ''}
                onChange={(value) =>
                  onChange(
                    sections.map((item, sectionIndex) =>
                      sectionIndex === index ? { ...item, bodyHtml: value } : item
                    )
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Checklist / Items</Label>
              <Input
                value={(section.items ?? []).join(', ')}
                onChange={(event) =>
                  onChange(
                    sections.map((item, sectionIndex) =>
                      sectionIndex === index
                        ? {
                            ...item,
                            items: event.target.value
                              .split(',')
                              .map((entry) => entry.trim())
                              .filter(Boolean),
                          }
                        : item
                    )
                  )
                }
                placeholder="Comma-separated items"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
