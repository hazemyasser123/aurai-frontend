import React, { useState, useRef } from 'react';

type Mode = 'edit' | 'preview';

interface HtmlEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  hint?: string;
  error?: string;
  minHeight?: string;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({
  label = 'Body',
  value,
  onChange,
  placeholder = 'Dear ...',
  id,
  hint,
  error,
  minHeight = '320px',
}) => {
  const [mode, setMode] = useState<Mode>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (before: string, after = '') => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + before + after);
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    // restore caret after inserted tag
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + before.length + selected.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label row — Figma: Body left, Edit HTML / Preview right */}
      <div className="flex flex-row justify-between items-center w-full">
        <label htmlFor={id} className="font-sans font-semibold text-xs leading-4 tracking-tight text-fg-strong">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMode('edit')}
            aria-pressed={mode === 'edit'}
            className={`font-sans font-bold text-xs leading-4 tracking-tight transition-colors duration-150 cursor-pointer ${
              mode === 'edit' ? 'text-primary underline underline-offset-2' : 'text-[#434749] hover:text-fg-strong'
            }`}
          >
            Edit HTML
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            aria-pressed={mode === 'preview'}
            className={`font-sans font-bold text-xs leading-4 tracking-tight transition-colors duration-150 cursor-pointer ${
              mode === 'preview' ? 'text-primary underline underline-offset-2' : 'text-[#434749] hover:text-fg-strong'
            }`}
          >
            Preview
          </button>
          <span className="font-sans font-normal text-xs text-fg-muted ml-1 hidden sm:inline">{value.length} chars</span>
        </div>
      </div>

      {mode === 'edit' ? (
        <>
          {/* Quick HTML tag toolbar — inserts raw tags like <h1>, <p>, <a>, <strong> etc. */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-bg-page border border-border rounded-lg">
            <span className="font-sans font-semibold text-[10px] leading-3 tracking-widest text-fg-muted uppercase mr-1">Insert:</span>
            {[
              { label: '<h1>', before: '<h1>', after: '</h1>' },
              { label: '<h2>', before: '<h2>', after: '</h2>' },
              { label: '<p>', before: '<p>', after: '</p>' },
              { label: '<a>', before: '<a href="https://">', after: '</a>' },
              { label: '<strong>', before: '<strong>', after: '</strong>' },
              { label: '<em>', before: '<em>', after: '</em>' },
              { label: '<ul>', before: '<ul>\n  <li>', after: '</li>\n</ul>' },
              { label: '<br>', before: '<br />', after: '' },
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => insertAtCursor(t.before, t.after)}
                className="px-2 py-1 bg-bg-card border border-border rounded-md font-mono font-medium text-xs text-fg-strong hover:border-border-focus hover:text-primary transition-colors duration-150 cursor-pointer"
                title={`Insert ${t.label}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder + ' — you can use HTML like <h1>, <p>, <a href="">, <strong>, <ul><li> etc.'}
            style={{ minHeight }}
            className={`flex w-full p-4 bg-bg-input border border-solid rounded-lg font-mono font-normal text-sm leading-6 tracking-tight text-fg-strong outline-none transition-[border-color,box-shadow] duration-150 ease-out placeholder:text-fg-body focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] resize-y ${
              error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(231,0,11,0.18)]' : 'border-border'
            }`}
          />
          <span className="font-sans font-normal text-xs text-fg-muted">
            Supports all HTML tags — e.g. <code className="px-1 py-0.5 bg-bg-muted rounded text-[11px]">&lt;h1&gt; &lt;h2&gt; &lt;p&gt; &lt;a href=""&gt; &lt;strong&gt; &lt;em&gt; &lt;ul&gt; &lt;li&gt; &lt;br&gt;</code>
          </span>
        </>
      ) : (
        <div
          style={{ minHeight }}
          className="w-full p-4 bg-bg-card border border-border rounded-lg font-sans font-normal text-sm leading-6 text-fg-strong overflow-auto"
        >
          {value ? (
            <div
              className="break-words max-w-none text-sm leading-6
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-3 [&_h1]:text-fg
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2.5 [&_h2]:text-fg
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
                [&_p]:my-3 [&_p]:leading-6
                [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary-dark
                [&_strong]:font-bold [&_strong]:text-fg [&_b]:font-bold
                [&_em]:italic [&_i]:italic
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
                [&_li]:ml-1 [&_li]:my-1
                [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3
                [&_code]:bg-bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
                [&_hr]:my-4 [&_hr]:border-border
                [&_br]:block"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          ) : (
            <span className="text-fg-body">{placeholder}</span>
          )}
        </div>
      )}

      {error ? (
        <span className="font-sans font-normal text-xs leading-4 text-danger">{error}</span>
      ) : hint ? (
        <span className="font-sans font-normal text-xs leading-4 text-fg-muted">{hint}</span>
      ) : null}
    </div>
  );
};
