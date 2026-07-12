import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CallToActionNodeView from './CallToActionNodeView';

export interface CallToActionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callToAction: {
      insertCallToAction: (options: { text: string; url: string; newTab: boolean; style: string }) => ReturnType;
    };
  }
}

export const CallToActionExtension = Node.create<CallToActionOptions>({
  name: 'callToAction',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      text: { default: 'Click Here' },
      url: { default: '#' },
      newTab: { default: true },
      style: { default: 'primary' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="call-to-action"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { text, url, newTab, style } = node.attrs;
    
    // Exact SVG for lucide MousePointerClick icon
    const svgIcon = ['svg', {
      xmlns: "http://www.w3.org/2000/svg",
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }, 
      ['path', { d: "M14 4.1 12 6" }],
      ['path', { d: "m5.1 8-2.9-.8" }],
      ['path', { d: "m6 12-1.9 2" }],
      ['path', { d: "M7.2 2.2 8 5.1" }],
      ['path', { d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z" }]
    ];

    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 'data-type': 'call-to-action', class: 'text-center my-6' }),
      [
        'a',
        {
          href: !url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#') && !url.startsWith('mailto:') ? `https://${url}` : url,
          target: newTab ? '_blank' : '_self',
          rel: newTab ? 'noopener noreferrer' : undefined,
          class: `ad-cta-button not-prose inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-sm hover:shadow-md no-underline ${
            style === 'primary' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : style === 'outline'
              ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`
        },
        svgIcon,
        text
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CallToActionNodeView);
  },

  addCommands() {
    return {
      insertCallToAction: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});
