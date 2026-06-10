'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Hash } from 'lucide-react';

interface FaqFormProps {
  title: string;
  subtitle: string;
  titleError?: string;
  subtitleError?: string;
  isDirty: boolean;
  saving: boolean;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onSave: () => void;
}

export function FaqForm({
  title,
  subtitle,
  titleError,
  subtitleError,
  isDirty,
  saving,
  onTitleChange,
  onSubtitleChange,
  onSave,
}: FaqFormProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground">Manage the public landing-page FAQ section.</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="secondary" className="text-amber-600 border-amber-300 bg-amber-50">
              Unsaved changes
            </Badge>
          )}
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" /> Header
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Title</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={titleError ? 'border-red-500' : ''}
            />
            {titleError && <p className="text-xs text-red-500">{titleError}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Subtitle</Label>
            <Textarea
              value={subtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              rows={3}
              className={subtitleError ? 'border-red-500' : ''}
            />
            {subtitleError && <p className="text-xs text-red-500">{subtitleError}</p>}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
