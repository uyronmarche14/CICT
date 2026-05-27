import { cn } from '@/lib/utils';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { Button } from './button';

interface RichTextEditorProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  value?: string;
}

export function RichTextEditor({
  onChange,
  placeholder = 'Start writing...',
  className,
  readOnly = false,
  value = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-6 space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-6 space-y-1',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: editorInstance }) => {
      const html = editorInstance.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose max-w-none focus:outline-none min-h-[150px] px-3 py-2 text-sm [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:ml-6 [&_li]:mb-1',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const toggleBulletList = () => {
    // debug removed

    // Check if we're already in a bullet list
    if (editor.isActive('bulletList')) {
      // If already in a bullet list, lift it out
      editor.chain().focus().liftListItem('listItem').run();
    } else {
      // If not in a list, wrap the current content in a bullet list
      editor.chain().focus().wrapIn('bulletList').run();
    }
  };

  const toggleOrderedList = () => {
    // debug removed

    // Check if we're already in an ordered list
    if (editor.isActive('orderedList')) {
      // If already in an ordered list, lift it out
      editor.chain().focus().liftListItem('listItem').run();
    } else {
      // If not in a list, wrap the current content in an ordered list
      editor.chain().focus().wrapIn('orderedList').run();
    }
  };

  return (
    <div
      className={cn(
        'border rounded-md bg-background overflow-hidden',
        className
      )}
    >
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-background">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
            title="Bold (Ctrl+B)"
            type="button"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
            title="Italic (Ctrl+I)"
            type="button"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleBulletList}
            className="h-8 w-8 p-0"
            title="Bullet List"
            type="button"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={toggleOrderedList}
            className="h-8 w-8 p-0"
            title="Numbered List"
            type="button"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-8 w-8 p-0"
            title="Quote"
            type="button"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className="h-8 w-8 p-0"
            title="Code Block"
            type="button"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            className="h-8 w-8 p-0"
            title="Insert Link"
            type="button"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-8 bg-border mx-1" />

          <Button
            variant={
              editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className="h-8 w-8 p-0"
            title="Align Left"
            type="button"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className="h-8 w-8 p-0"
            title="Align Center"
            type="button"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className="h-8 w-8 p-0"
            title="Align Right"
            type="button"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className="h-8 w-8 p-0"
            title="Justify"
            type="button"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="relative overflow-auto max-h-[400px]">
        <EditorContent editor={editor} />
        {(!value || value === '<p></p>') && (
          <div className="absolute top-2 left-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
