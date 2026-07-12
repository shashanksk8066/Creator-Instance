import { NodeViewWrapper } from '@tiptap/react';
import { MousePointerClick } from 'lucide-react';
import { clsx } from 'clsx';

export default function CallToActionNodeView(props: any) {
  const { text, url, newTab, style } = props.node.attrs;

  const styleClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  const selectedClass = styleClasses[style as keyof typeof styleClasses] || styleClasses.primary;

  return (
    <NodeViewWrapper className="call-to-action-wrapper my-6 text-center" data-type="call-to-action">
      <a 
        href={url}
        target={newTab ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className={clsx(
          "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-sm hover:shadow-md",
          selectedClass
        )}
        // Prevent default click in editor so it doesn't navigate away
        onClick={(e) => {
          if (props.editor.isEditable) {
            e.preventDefault();
          }
        }}
      >
        <MousePointerClick size={20} />
        {text}
      </a>
    </NodeViewWrapper>
  );
}
