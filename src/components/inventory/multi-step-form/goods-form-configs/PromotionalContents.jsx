/* eslint-disable jsx-a11y/alt-text */
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image, Upload, Video, X } from 'lucide-react';
import React from 'react';
import { FileUploader } from 'react-drag-drop-files';

export default function PromotionalContents({
  formData,
  setFormData,
  // errors,
  translation,
}) {
  // handle nested offers state
  const handleChange = (key) => (value) => {
    setFormData((prev) => {
      const currentSeo =
        typeof prev.seo === 'object' && prev.seo !== null ? prev.seo : {};

      const cleanSeo = {
        seoTitle: currentSeo.seoTitle ?? null,
        seoKeywords: currentSeo.seoKeywords ?? null,
        seoMetaDescription: currentSeo.seoMetaDescription ?? null,
      };

      return {
        ...prev,
        seo: {
          ...cleanSeo,
          [key]: value,
        },
      };
    });
  };

  // Upload handler (images / videos)
  const handleUpload = (type) => (files) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);

    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: [...(prev.files?.[type] || []), ...fileArray],
      },
    }));
  };

  // Remove file
  const handleRemove = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [type]: prev.files[type].filter((_, i) => i !== index),
      },
    }));
  };

  // Remove existing file
  const handleRemoveExisting = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index),
    }));
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return 'file';
    const path = url.split('?')[0];
    return path.substring(path.lastIndexOf('/') + 1) || 'file';
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.promotionalContent.section1.title')}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Product Images</Label>

          <FileUploader
            multiple
            handleChange={handleUpload('images')}
            name="images"
            types={['png', 'jpeg', 'jpg']}
          >
            <div className="cursor-pointer rounded border-2 border-dashed px-5 py-10 text-center">
              <Image size={40} className="mx-auto text-gray-300" />
              <p className="text-sm">Click to upload images</p>
              <Button size="sm" variant="outline" className="mt-2">
                <Upload size={16} /> Upload Images
              </Button>
            </div>
          </FileUploader>

          {/* Existing Images */}
          {formData?.imageDocuments?.map((doc, index) => {
            const name =
              doc?.fileName ||
              doc?.name ||
              getFilenameFromUrl(doc?.url || doc?.document?.url) ||
              `Image ${index + 1}`;
            const url = doc?.url || doc?.document?.url;
            return (
              <div
                key={doc.id || url || index}
                className="mt-2 flex items-center justify-between rounded border border-blue-200 bg-blue-50/50 p-2 text-xs"
              >
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[80%] truncate font-medium text-blue-600 underline hover:text-blue-800"
                  >
                    {name}
                  </a>
                ) : (
                  <span className="max-w-[80%] truncate font-medium text-gray-500">
                    {name}
                  </span>
                )}
                <X
                  className="cursor-pointer text-red-500 hover:text-red-700"
                  size={14}
                  onClick={() => handleRemoveExisting('imageDocuments', index)}
                />
              </div>
            );
          })}

          {/* New Image List */}
          {formData?.files?.images?.map((file, index) => (
            <div
              key={file.name}
              className="mt-2 flex items-center justify-between rounded border p-2 text-xs"
            >
              <span className="max-w-[80%] truncate">{file.name}</span>
              <X
                className="cursor-pointer text-red-500 hover:text-red-700"
                size={14}
                onClick={() => handleRemove('images', index)}
              />
            </div>
          ))}
        </div>

        <div>
          <Label>Product Videos</Label>

          <FileUploader
            multiple
            handleChange={handleUpload('videos')}
            name="videos"
            types={['mp4', 'mov']}
          >
            <div className="cursor-pointer rounded border-2 border-dashed px-5 py-10 text-center">
              <Video size={40} className="mx-auto text-gray-300" />
              <p className="text-sm">Click to upload videos</p>
              <Button size="sm" variant="outline" className="mt-2">
                <Upload size={16} /> Upload Videos
              </Button>
            </div>
          </FileUploader>

          {/* Existing Videos */}
          {formData?.videoDocuments?.map((doc, index) => {
            const name =
              doc?.fileName ||
              doc?.name ||
              getFilenameFromUrl(doc?.url || doc?.document?.url) ||
              `Video ${index + 1}`;
            const url = doc?.url || doc?.document?.url;
            return (
              <div
                key={doc.id || url || index}
                className="mt-2 flex items-center justify-between rounded border border-blue-200 bg-blue-50/50 p-2 text-xs"
              >
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[80%] truncate font-medium text-blue-600 underline hover:text-blue-800"
                  >
                    {name}
                  </a>
                ) : (
                  <span className="max-w-[80%] truncate font-medium text-gray-500">
                    {name}
                  </span>
                )}
                <X
                  className="cursor-pointer text-red-500 hover:text-red-700"
                  size={14}
                  onClick={() => handleRemoveExisting('videoDocuments', index)}
                />
              </div>
            );
          })}

          {/* New Video List */}
          {formData?.files?.videos?.map((file, index) => (
            <div
              key={file.name}
              className="mt-2 flex items-center justify-between rounded border p-2 text-xs"
            >
              <span className="max-w-[80%] truncate">{file.name}</span>
              <X
                className="cursor-pointer text-red-500 hover:text-red-700"
                size={14}
                onClick={() => handleRemove('videos', index)}
              />
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.promotionalContent.section2.title')}
      </h2>

      <div className="flex flex-col gap-4">
        {/* SEO Title */}
        <div>
          <Label>SEO Title</Label>
          <Input
            placeholder="Enter SEO-optimized title"
            value={formData?.seo?.seoTitle || ''}
            onChange={(e) => handleChange('seoTitle')(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Recommended: 50-60 characters
          </p>
        </div>

        {/* SEO Keywords */}
        <div>
          <Label>SEO Keywords</Label>
          <Input
            placeholder="Enter SEO keywards seprated by commas (,)"
            value={formData?.seo?.seoKeywords || ''}
            onChange={(e) => handleChange('seoKeywords')(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: electronics, smartphone, 5G phone
          </p>
        </div>

        <div className="col-span-3">
          <Label>SEO Meta Description</Label>
          <Textarea
            placeholder="Enter SEO meta description"
            rows={4}
            maxLength={160}
            value={formData?.seo?.seoMetaDescription || ''}
            onChange={(e) => handleChange('seoMetaDescription')(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Recommended: 150–160 characters
          </p>
        </div>
      </div>
    </div>
  );
}
