import { templateApi } from '@/api/templates_api/template_api';
import { APIinstance } from '@/services';
import { toast } from 'sonner';

export function getTemplates(id) {
  return APIinstance.get(`${templateApi.getTemplates.endpoint}${id}`);
}

export function getTemplate(id) {
  return APIinstance.get(`${templateApi.getTemplate.endpoint}${id}`);
}

export function uploadTemplate(data, id) {
  return APIinstance.post(`${templateApi.uploadTemplate.endpoint}${id}`, data);
}

export function updateTemplate(data, id) {
  return APIinstance.put(`${templateApi.updateTemplate.endpoint}${id}`, data);
}

export function deleteTemplate(id) {
  return APIinstance.delete(`${templateApi.deleteTemplate.endpoint}${id}`);
}

export function createFormResponse(data) {
  return APIinstance.post(templateApi.createFormResponse.endpoint, data);
}

export function updateFormResponse(data, id) {
  return APIinstance.put(
    `${templateApi.updateFormResponse.endpoint}${id}`,
    data,
  );
}
export function getDocument(urlString) {
  return APIinstance.post(templateApi.getS3Document.endpoint, {
    urlString,
  });
}

export const viewPdfInNewTab = async (urlString) => {
  try {
    const response = await APIinstance.post(
      templateApi.viewDocument.endpoint,
      { urlString },
      { responseType: 'blob' },
    );

    const pdfBlob = response.data;
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Extract filename from the URL string
    let filename = 'document.pdf';

    if (urlString) {
      const { pathname } = new URL(urlString);
      const namePart = pathname.substring(pathname.lastIndexOf('/') + 1);
      filename = `${namePart.split('.').slice(0, -1).join('.')}.pdf`;
    }

    // Create an HTML string with a custom title and iframe to show the PDF
    const htmlContent = `
      <html>
        <head><title>${filename}</title></head>
        <body style="margin:0">
          <iframe src="${pdfUrl}" type="application/pdf" width="100%" height="100%" style="border:none;"></iframe>
        </body>
      </html>
    `;

    const newTab = window.open();
    if (newTab) {
      newTab.document.open();
      newTab.document.write(htmlContent);
      newTab.document.close();
    } else {
      toast.error('Popup blocked. PDF download instead.');
    }
  } catch (error) {
    toast.error('Error fetching PDF');
  }
};
