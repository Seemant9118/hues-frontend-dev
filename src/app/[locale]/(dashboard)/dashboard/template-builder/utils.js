import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { toast } from 'sonner';

// Style tags injecting tip tap basic layout CSS
export const getTipTapStyles = () => {
  return (
    <style>{`
        .ProseMirror {
          outline: none;
          min-height: 480px;
          font-family: inherit;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          font-weight: 700;
          color: #1a202c;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror h1 { font-size: 1.75rem; border-b: 1px solid #edf2f7; padding-bottom: 0.5rem; }
        .ProseMirror h2 { font-size: 1.4rem; }
        .ProseMirror h3 { font-size: 1.15rem; }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #cbd5e0;
          padding-left: 1rem;
          color: #718096;
          font-style: italic;
          margin-bottom: 1rem;
        }
      `}</style>
  );
};

// Custom TipTap extension for variable pill rendering
export const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      label: {
        default: '',
        parseHTML: (element) => {
          const attr = element.getAttribute('label');
          if (attr) return attr.replace(/[{}]/g, '').trim();
          return element.textContent.replace(/[{}]/g, '').trim();
        },
      },
      id: {
        default: '',
        parseHTML: (element) => {
          const idAttr = element.getAttribute('id');
          if (idAttr) return idAttr.replace(/[{}]/g, '').trim();
          const labelAttr = element.getAttribute('label');
          if (labelAttr) return labelAttr.replace(/[{}]/g, '').trim();
          return element.textContent.replace(/[{}]/g, '').trim();
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const cleanLabel = (HTMLAttributes.label || '').replace(/[{}]/g, '').trim();
    const displayLabel = cleanLabel ? `{{${cleanLabel}}}` : '';
    return [
      'span',
      mergeAttributes(
        {
          'data-variable': '',
          class:
            'inline-block bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 mx-1 rounded text-xs border border-blue-200 select-none cursor-pointer hover:bg-blue-100 transition-colors',
        },
        HTMLAttributes,
      ),
      displayLabel,
    ];
  },
});

// ProseMirror plugin inside TipTap extension to handle variable drop events
export const DragAndDropExtension = Extension.create({
  name: 'dragAndDrop',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dragAndDropPlugin'),
        props: {
          handleDrop(view, event) {
            const data = event.dataTransfer?.getData('application/json');
            if (!data) return false;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'variable') {
                const coordinates = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });

                if (coordinates) {
                  const { schema } = view.state;
                  const node = schema.nodes.variable.create({
                    label: parsed.label,
                    id: parsed.id,
                  });
                  const transaction = view.state.tr.insert(
                    coordinates.pos,
                    node,
                  );
                  view.dispatch(transaction);
                  return true;
                }
              }
            } catch (e) {
              toast.error('Failed to parse dropped item:', e);
            }
            return false;
          },
        },
      }),
    ];
  },
});

// Mock values for Preview mode variable rendering
export const MOCK_VALUES = {
  USER_NAME: 'John Doe',
  USER_EMAIL: 'john.doe@example.com',
  USER_MOBILE: '+91 98765 43210',
  USER_PAN: 'ABCDE1234F',
  USER_AADHAAR: 'XXXX-XXXX-1234',
  CLIENT_NAME: 'Acme Corp',
  CLIENT_GST: '27AAAAA0000A1Z5',
  CLIENT_PAN: 'GSTPAN1234M',
  CLIENT_ADDRESS: '123 Business Park, Sector 62, Noida, UP',
  CLIENT_EMAIL: 'contact@acmecorp.com',
  CLIENT_MOBILE: '+91 99999 88888',
  VENDOR_NAME: 'Hues Inc.',
  VENDOR_GST: '27BBBBB1111B2Z6',
  VENDOR_PAN: 'VNDPAN5678K',
  VENDOR_ADDRESS: '456 Tech Hub, HSR Layout, Bangalore, KA',
  VENDOR_EMAIL: 'billing@hues.com',
  VENDOR_MOBILE: '+91 88888 77777',
  CUSTOMER_NAME: 'Alice Smith',
  CUSTOMER_EMAIL: 'alice@gmail.com',
  CUSTOMER_MOBILE: '+91 77777 66666',
  CUSTOMER_ADDRESS: '789 Residential Apt, Andheri West, Mumbai, MH',
  CUSTOMER_GST: '27CCCCC2222C3Z7',
  MEMBER_NAME: 'Bob Johnson',
  MEMBER_EMAIL: 'bob@hues.com',
  MEMBER_MOBILE: '+91 66666 55555',
  MEMBER_ROLE: 'Administrator',
  AGREEMENT_DATE: 'June 18, 2026',
  AGREEMENT_ID: 'AGR-2026-98765',
  SERVICE_NAME: 'Cloud Infrastructure Management',
  SERVICE_PRICE: '$4,500/month',
  USER_SIGNATURE_IMAGE: '[Signature Image]',
  SIGNATURE_DATE: 'June 18, 2026',
  SIGNER_NAME: 'John Doe',
};
