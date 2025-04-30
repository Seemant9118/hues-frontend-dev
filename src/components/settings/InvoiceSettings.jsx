import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import InvoicePreview from '../ui/InvoicePreview';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import Wrapper from '../wrappers/Wrapper';

// Dummy data for invoice types
const INVOICE_TYPE_DATA = [
  {
    id: 1,
    type: 'b2c',
    name: 'B2C (Business to Consumer)',
    description:
      'For direct sales to individual consumers, usually without GST registration.',
  },
  {
    id: 2,
    type: 'b2b',
    name: 'B2B (Business to Business)',
    description:
      'For transactions between two registered businesses with GST details.',
  },
];

export default function InvoiceSettings({
  settings,
  templates,
  createSettingMutation,
}) {
  const [currPreviewSkin, setCurrPreviewSkin] = useState(null);
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [remarks, setRemarks] = useState('Thank you for your business!');
  const [socialLink, setSocialLink] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formattedTemplates, setFormattedTemplates] = useState([]);
  const [defaultInvoiceType, setDefaultInvoiceType] = useState('');

  useEffect(() => {
    if (settings?.settings) {
      const customerRemarkSetting = settings.settings.find(
        (s) => s.key === 'CUSTOMER_REMARK',
      );
      const socialLinkSetting = settings.settings.find(
        (s) => s.key === 'SOCIAL_LINK',
      );

      const defaultInvoiceTypeSettings = settings.settings.find(
        (item) => item.key === 'invoice.default.type',
      )?.value;

      if (customerRemarkSetting) {
        setRemarks(customerRemarkSetting.value);
      }

      if (socialLinkSetting) {
        setSocialLink(socialLinkSetting.value);
      }

      if (defaultInvoiceTypeSettings) {
        setDefaultInvoiceType(defaultInvoiceTypeSettings);
      }
    }
  }, [settings]);

  useEffect(() => {
    if (!templates) return;

    const transformedTemplates = templates?.map((template) => ({
      id: template.id,
      title: template.title,
      description:
        template?.description || 'Clean, professional design with blue accents',
      image: template?.image ? `data:image/png;base64,${template.image}` : '',
      isDefault: template?.isDefault || false,
    }));

    setFormattedTemplates(transformedTemplates);

    const defaultSkin = transformedTemplates.find((t) => t.isDefault);
    setSelectedSkin(defaultSkin || transformedTemplates[0]);
  }, [templates]);

  // skin update
  const handleUpdateSkin = (skin) => {
    setSelectedSkin(skin);

    const payload = {
      contextKey: 'INVOICE',
      settings: [
        {
          key: 'invoice.plugin.default.theme',
          value: skin?.id, // extract numeric ID
        },
      ],
    };

    createSettingMutation.mutate(payload);
  };

  // customer remarks update
  const handleCustomerRemarkUpdate = (remarks) => {
    const payload = {
      contextKey: 'INVOICE',
      settings: [
        {
          key: 'CUSTOMER_REMARK',
          value: remarks,
        },
      ],
    };

    createSettingMutation.mutate(payload);
  };

  // social link update
  const handleSocialLinkUpdate = (link) => {
    const payload = {
      contextKey: 'INVOICE',
      settings: [
        {
          key: 'SOCIAL_LINK',
          value: link,
        },
      ],
    };

    createSettingMutation.mutate(payload);
  };

  const handleSelect = (itemType) => {
    if (itemType) {
      const payload = {
        contextKey: 'INVOICE',
        settings: [
          {
            key: 'invoice.default.type',
            value: itemType,
          },
        ],
      };
      createSettingMutation.mutate(payload);
    }
  };

  return (
    <Wrapper className="flex flex-col gap-10 p-2">
      {!isPreviewOpen && (
        <div className="flex flex-col gap-4">
          {/* Invoice Type */}
          <div className="flex w-full flex-col gap-4">
            <Label className="text-sm font-medium">Default Invoice Type</Label>

            <div className="grid gap-4 sm:grid-cols-2">
              {INVOICE_TYPE_DATA?.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleSelect(item.type)}
                  className={cn(
                    'flex cursor-pointer flex-col gap-2 rounded-xl border p-4 shadow-sm transition hover:border-primary',
                    defaultInvoiceType === item.type &&
                      'border-primary bg-muted',
                  )}
                >
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Skins */}
          <div className="flex flex-col gap-4">
            <Label className="text-sm font-medium">Default Skin</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {formattedTemplates?.map((skin) => (
                <div
                  key={skin.id}
                  className={`cursor-pointer space-y-2 rounded-lg border p-4 transition hover:shadow-md ${
                    selectedSkin?.id === skin.id
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-200'
                  }`}
                  onClick={() => handleUpdateSkin(skin)}
                >
                  <h3 className="font-semibold">{skin.title}</h3>
                  <p className="text-sm text-gray-500">{skin.description}</p>
                  <div className="relative aspect-[5/3] overflow-hidden rounded bg-gray-50">
                    <Image
                      src={skin.image || '/InvoiceType1.png'}
                      alt={skin.title}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>

                  <Button
                    variant="blue_outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering skin select
                      setIsPreviewOpen(true);
                      setCurrPreviewSkin(skin.image);
                    }}
                  >
                    Preview
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col">
            <Label className="mb-2 block text-sm font-medium">
              Custom Remarks
            </Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-28 w-full resize-none rounded-md border p-2"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRemarks('');
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                variant="blue_outline"
                onClick={() => {
                  handleCustomerRemarkUpdate(remarks);
                }}
              >
                Save
              </Button>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-col">
            <Label className="mb-2 block text-sm font-medium">
              Add Social links
            </Label>
            <Input
              type="text"
              placeholder="Add link here"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              className="w-full rounded-md border p-2"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSocialLink('');
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                variant="blue_outline"
                onClick={() => {
                  handleSocialLinkUpdate(socialLink);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      {isPreviewOpen && selectedSkin && (
        <InvoicePreview
          handleSelectFn={() => handleUpdateSkin(selectedSkin)}
          isSelectable={true}
          setIsPreviewOpen={setIsPreviewOpen}
          url={currPreviewSkin}
          isPDFProp={false}
        />
      )}
    </Wrapper>
  );
}
