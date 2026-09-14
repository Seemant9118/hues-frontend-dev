import { templateApi } from '@/api/templates_api/template_api';
import { APIinstance } from '@/services';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { toast } from 'sonner';

/**
 * Generic reusable function to preview any media attachment (images, PDFs, videos, text)
 * in a new browser tab without triggering automatic downloads.
 * Includes a custom in-tab toolbar with document title and an explicit Download button.
 *
 * @param {string|Object} target - URL string or attachment object ({ url, fileName, fileType, ... })
 * @param {string} [customFileName] - Optional file name override
 * @param {string} [customFileType] - Optional file/MIME type override
 */
export async function previewMediaInNewTab(
  target,
  customFileName,
  customFileType,
) {
  if (!target) return;

  // 1. Resolve parameters from target (string or object)
  const isObject = typeof target === 'object' && target !== null;
  const url = isObject
    ? target.url ||
      target.documentSlug ||
      target.document?.url ||
      target.path ||
      ''
    : target;

  if (!url) {
    toast.error('Unable to preview: invalid attachment URL');
    return;
  }

  let fileName = isObject
    ? target.name ||
      target.fileName ||
      target.displayName ||
      target.title ||
      customFileName
    : customFileName;

  if (!fileName) {
    const cleanPath = url.split('?')[0];
    fileName =
      cleanPath.substring(cleanPath.lastIndexOf('/') + 1) || 'document';
  }

  const fileType = isObject
    ? target.type || target.fileType || target.mimeType || customFileType
    : customFileType;

  // 2. Open new tab immediately to prevent browser popup blocking
  const newTab = window.open('', '_blank');
  if (!newTab) {
    toast.error('Popup blocked. Please allow popups for this site.');
    return;
  }

  // 3. Write sleek loading skeleton
  newTab.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Loading ${fileName}...</title>
        <style>
          body {
            margin: 0;
            background: #090d16;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 34px;
            height: 34px;
            animation: spin 0.9s linear infinite;
            margin: 0 auto 14px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div style="text-align: center;">
          <div class="spinner"></div>
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">Loading ${fileName}...</p>
        </div>
      </body>
    </html>
  `);

  try {
    // 4. Resolve authenticated public URL from S3 service
    let publicUrl = url;
    try {
      const res = await getDocument(url);
      if (res?.data?.data?.publicUrl) {
        publicUrl = res.data.data.publicUrl;
      }
    } catch {
      // Fallback to url if getDocument fails
    }

    // 5. Determine file classification
    const cleanUrl = (publicUrl || url).split('?')[0].toLowerCase();
    const typeStr = (fileType || '').toLowerCase();

    const isPdf = typeStr.includes('pdf') || cleanUrl.endsWith('.pdf');

    const isImage =
      typeStr.startsWith('image/') ||
      /\.(webp|png|jpe?g|gif|svg|bmp|avif)$/i.test(cleanUrl);

    const isVideo =
      typeStr.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(cleanUrl);

    const isAudio =
      typeStr.startsWith('audio/') || /\.(mp3|wav|ogg|aac)$/i.test(cleanUrl);

    let contentHtml = '';

    if (isPdf) {
      // Fetch blob to bypass any Content-Disposition: attachment header
      let pdfSourceUrl = publicUrl;
      try {
        const blobRes = await APIinstance.post(
          templateApi.viewDocument.endpoint,
          { urlString: url },
          { responseType: 'blob' },
        );
        if (blobRes?.data) {
          pdfSourceUrl = URL.createObjectURL(blobRes.data);
        }
      } catch {
        // Fallback to publicUrl
      }

      contentHtml = `
        <iframe src="${pdfSourceUrl}#toolbar=1" type="application/pdf" width="100%" height="100%" style="border:none;"></iframe>
      `;
    } else if (isImage) {
      contentHtml = `
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 24px;">
          <img src="${publicUrl}" alt="${fileName}" style="max-width: 95%; max-height: 90vh; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);" />
        </div>
      `;
    } else if (isVideo) {
      contentHtml = `
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 24px;">
          <video controls style="max-width: 95%; max-height: 85vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
            <source src="${publicUrl}" />
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    } else if (isAudio) {
      contentHtml = `
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;">
          <audio controls style="width: 100%; max-width: 500px;">
            <source src="${publicUrl}" />
            Your browser does not support the audio element.
          </audio>
        </div>
      `;
    } else {
      // General fallback iframe with embedded preview
      contentHtml = `
        <div style="flex: 1; display: flex; flex-direction: column; height: 100%;">
          <iframe src="${publicUrl}" style="flex: 1; width: 100%; height: 100%; border: none;"></iframe>
        </div>
      `;
    }

    // 6. Build the standalone preview document with download action
    const viewerHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${fileName}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              background: #090d16;
              color: #f1f5f9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              height: 100vh;
              overflow: hidden;
            }
            .header {
              height: 52px;
              background: #111827;
              border-bottom: 1px solid #1f2937;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 20px;
              flex-shrink: 0;
              z-index: 10;
            }
            .title-area {
              display: flex;
              align-items: center;
              gap: 10px;
              min-width: 0;
            }
            .file-name {
              font-size: 13px;
              font-weight: 600;
              color: #f3f4f6;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 500px;
            }
            .actions {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 14px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }
            .btn-download {
              background: #2563eb;
              color: white;
            }
            .btn-download:hover {
              background: #1d4ed8;
            }
            .main-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              height: calc(100vh - 52px);
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-area">
              <span class="file-name" title="${fileName}">${fileName}</span>
            </div>
            <div class="actions">
              <a href="${publicUrl}" download="${fileName}" class="btn btn-download">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </a>
            </div>
          </div>
          <div class="main-content">
            ${contentHtml}
          </div>
        </body>
      </html>
    `;

    newTab.document.open();
    newTab.document.write(viewerHtml);
    newTab.document.close();
  } catch (err) {
    newTab.document.body.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #ef4444; font-family: sans-serif;">
        <h3>Failed to load preview</h3>
        <p style="color: #94a3b8; font-size: 13px;">${err?.message || 'An error occurred while fetching the document.'}</p>
      </div>
    `;
  }
}
