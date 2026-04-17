'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write your elective diary here...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose-diary focus:outline-none p-4 min-h-[400px]',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  if (!editor) return null

  const ToolbarBtn = ({
    onClick,
    active,
    title,
    icon,
  }: {
    onClick: () => void
    active?: boolean
    title: string
    icon: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>
    </button>
  )

  return (
    <div className="border border-outline-variant/50 rounded-xl overflow-hidden bg-surface-container-lowest">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-1 px-3 py-2 border-b border-outline-variant/20 bg-surface-container/40">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
          icon="format_bold"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
          icon="format_italic"
        />
        <div className="w-px h-5 bg-outline-variant/30 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
          icon="title"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
          icon="format_size"
        />
        <div className="w-px h-5 bg-outline-variant/30 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
          icon="format_list_bulleted"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
          icon="format_list_numbered"
        />
        <div className="w-px h-5 bg-outline-variant/30 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
          icon="format_quote"
        />
        <div className="w-px h-5 bg-outline-variant/30 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
          icon="undo"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
          icon="redo"
        />
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
