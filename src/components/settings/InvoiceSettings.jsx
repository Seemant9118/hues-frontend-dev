import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import InvoicePreview from '../ui/InvoicePreview';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import Wrapper from '../wrappers/Wrapper';

const skins = [
  {
    id: 'basic-blue',
    title: 'Basic Blue',
    description: 'Clean, professional design with blue accents',
    image: '/InvoiceType1.png',
  },
  {
    id: 'emerald',
    title: 'Emerald',
    description: 'Clean, professional design with emerald accents',
    image: '/InvoiceType2.png',
  },
  {
    id: 'royal-blue',
    title: 'Royal Blue',
    description: 'Clean, professional design with royal blue accents',
    image: '/InvoiceType3.png',
  },
];

export default function InvoiceSettings() {
  const [selectedSkin, setSelectedSkin] = useState('basic-blue');
  const [remarks, setRemarks] = useState('Thank you for your business!');
  const [socialLink, setSocialLink] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <Wrapper className="flex flex-col gap-10 p-2">
      {!isPreviewOpen && (
        <div>
          {/* Skins */}
          <div className="flex flex-col gap-4">
            <Label className="text-sm font-medium">Default Skin</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {skins.map((skin) => (
                <div
                  key={skin.id}
                  className={`cursor-pointer space-y-2 rounded-lg border p-4 transition hover:shadow-md ${
                    selectedSkin === skin.id
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedSkin(skin.id)}
                >
                  <h3 className="font-semibold">{skin.title}</h3>
                  <p className="text-sm text-gray-500">{skin.description}</p>
                  <div className="relative aspect-[5/3] overflow-hidden rounded bg-gray-50">
                    <Image
                      src={skin.image}
                      alt={skin.title}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>

                  <Button
                    variant="blue_outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setIsPreviewOpen(true)}
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
              <Button size="sm" variant="outline">
                Discard
              </Button>
              <Button size="sm" variant="blue_outline">
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
              <Button size="sm" variant="outline">
                Discard
              </Button>
              <Button size="sm" variant="blue_outline">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      {isPreviewOpen && (
        <InvoicePreview
          setIsPreviewOpen={setIsPreviewOpen}
          url={selectedSkin.image}
        />
      )}
    </Wrapper>
  );
}
