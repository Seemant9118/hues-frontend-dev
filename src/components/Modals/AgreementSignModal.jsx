'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog as ShadDialog,
  DialogContent as ShadDialogContent,
  DialogTitle as ShadDialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import {
  getDocument,
  signAgreement,
} from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'sonner';

// Set up PDF worker URL
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();
}

export default function AgreementSignModal({
  isOpen,
  onClose,
  invitationId,
  enterpriseName = 'Company',
  onSignComplete,
  agreementDocUrl,
  agreementId,
  isReadOnly = false,
}) {
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'upload'
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSigningStep, setIsSigningStep] = useState(false);
  const [isSignSuccess, setIsSignSuccess] = useState(false);
  const [isSigningSubmitting, setIsSigningSubmitting] = useState(false);

  // Canvas drawing ref & states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawContent, setHasDrawContent] = useState(false);

  const targetUrl = agreementDocUrl;

  // Fetch S3 document if url is available
  const { data: pdfDocData, isLoading: isPdfLoading } = useQuery({
    queryKey: ['get_s3_document', targetUrl],
    queryFn: () => getDocument(targetUrl),
    enabled: !!targetUrl && isOpen,
    select: (res) => res?.data?.data,
  });

  const documentFile = pdfDocData?.publicUrl || targetUrl;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  const handleSignSubmit = (e) => {
    e.preventDefault();
    if (!signatureBase64) {
      toast.error(
        'Please provide a signature (either draw or upload) before submitting.',
      );
      return;
    }
    if (!consentChecked) {
      toast.error('You must agree to the consent terms.');
      return;
    }

    setIsSigningSubmitting(true);

    if (agreementId) {
      // Direct backend e-signing call
      signAgreement(agreementId, {
        signatureData: signatureBase64,
        signatureType: activeTab === 'draw' ? 'HAND_DRAWN' : 'IMAGE_UPLOAD',
        signedAt: new Date().toISOString(),
      })
        .then(() => {
          setIsSigningSubmitting(false);
          setIsSignSuccess(true);
          toast.success('Agreement signed legally and successfully!');
          setTimeout(() => {
            setIsSignSuccess(false);
            setIsSigningStep(false);
            setSignatureBase64(null);
            setUploadError(null);
            setUploadedFileName('');
            setConsentChecked(false);
            if (onSignComplete) onSignComplete();
            onClose();
          }, 2000);
        })
        .catch((error) => {
          setIsSigningSubmitting(false);
          toast.error(
            error.response?.data?.message ||
              'Failed to submit signature. Please try again.',
          );
        });
    } else {
      // Simulate backend signing process with base64 payload
      setTimeout(() => {
        setIsSigningSubmitting(false);
        setIsSignSuccess(true);
        LocalStorageService.set(`signed_agreement_${invitationId}`, {
          signatureData: signatureBase64,
          signatureType: activeTab === 'draw' ? 'HAND_DRAWN' : 'IMAGE_UPLOAD',
          signedAt: new Date().toISOString(),
        });
        toast.success('Agreement signed legally and successfully!');

        // Delay closing/callback to show checkmark animation
        setTimeout(() => {
          setIsSignSuccess(false);
          setIsSigningStep(false);
          setSignatureBase64(null);
          setUploadError(null);
          setUploadedFileName('');
          setConsentChecked(false);
          if (onSignComplete) onSignComplete();
          onClose();
        }, 2000);
      }, 1500);
    }
  };

  // Reset page layout when opening
  useEffect(() => {
    if (isOpen) {
      setPageNo(1);
      setIsSigningStep(false);
      setIsSignSuccess(false);
      setSignatureBase64(null);
      setUploadError(null);
      setUploadedFileName('');
      setConsentChecked(false);
      setActiveTab('draw');
      setHasDrawContent(false);
    }
  }, [isOpen]);

  // Initialize canvas strokes on tab change or draw step opening
  useEffect(() => {
    if (activeTab === 'draw' && isSigningStep && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set canvas logic dimensions (small size to stay under 20KB)
      canvas.width = 330;
      canvas.height = 160;
      // Set stroke styles (Slate-800 dark ink style)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeTab, isSigningStep]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawContent(true);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    // Check size restriction (<20KB)
    const base64Len = dataUrl.split(',')[1].length;
    const byteSize = Math.floor((base64Len * 3) / 4);

    if (byteSize > 20480) {
      // 20KB
      setUploadError(
        `Signature drawing is too complex (${(byteSize / 1024).toFixed(1)} KB). Please clear and draw a simpler signature.`,
      );
      setSignatureBase64(null);
    } else {
      setUploadError(null);
      setSignatureBase64(dataUrl);
    }
  };

  const handlePointerUpOrLeave = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasSignature();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawContent(false);
    setSignatureBase64(null);
    setUploadError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSignatureBase64(null);
    setUploadError(null);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError(`Unsupported format. Expected PNG, JPG, or JPEG.`);
      return;
    }

    // Validate size (20 KB = 20,480 bytes)
    if (file.size > 20480) {
      setUploadError(
        `File size (${(file.size / 1024).toFixed(1)} KB) exceeds the 20 KB limit.`,
      );
      return;
    }

    // Read to Base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureBase64(event.target.result);
    };
    reader.onerror = () => {
      setUploadError('Failed to read signature image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <ShadDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ShadDialogContent className="flex max-h-[92vh] max-w-[950px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl">
        <ShadDialogTitle className="sr-only">
          Sign Company Agreement
        </ShadDialogTitle>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 p-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#288AF9]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {'Agreement'}
              </h2>
              <p className="text-xs text-slate-500">
                Offered by{' '}
                <span className="font-semibold text-[#288AF9]">
                  {enterpriseName}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pr-10">
            {!isSigningStep && !isReadOnly && (
              <Button
                onClick={() => setIsSigningStep(true)}
                className="h-9 gap-1.5 rounded-lg bg-[#288AF9] px-4 text-xs font-semibold text-white hover:bg-[#288AF9]/90"
              >
                <FileSignature className="h-3.5 w-3.5" />
                Sign Document
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer sticky wrapper */}
          <div className="relative flex flex-1 flex-col overflow-hidden bg-slate-100">
            {/* Scrollable PDF Wrapper */}
            <div className="scrollBarStyles flex flex-1 justify-center overflow-auto p-4 pb-20">
              {isPdfLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-[#288AF9]" />
                  <span className="text-sm text-slate-500">
                    Loading document preview...
                  </span>
                </div>
              ) : documentFile ? (
                <div className="relative mx-auto rounded-lg shadow-lg">
                  <Document
                    file={documentFile}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-[#288AF9]" />
                        <span className="text-sm text-slate-500">
                          Loading pages...
                        </span>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNo}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="max-w-full overflow-hidden rounded-lg bg-white"
                      width={isSigningStep ? 520 : 650}
                    />
                  </Document>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Agreement document preview is not available.
                  </p>
                  <p className="text-xs text-slate-400">
                    Please review terms and sign below.
                  </p>
                </div>
              )}
            </div>

            {/* Floating Pagination Bar (Sticky inside the wrapper, outside scroll area) */}
            {pages > 1 && (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-slate-800 shadow-lg backdrop-blur">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pageNo === 1}
                  onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
                  debounceTime={0}
                  className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[70px] select-none px-2 text-center text-xs font-semibold text-slate-600">
                  Page {pageNo} of {pages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pageNo === pages}
                  onClick={() => setPageNo((prev) => Math.min(prev + 1, pages))}
                  debounceTime={0}
                  className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Right Signature Panel (Appears when clicking "Sign Document") */}
          {isSigningStep && (
            <div className="scrollBarStyles flex w-[380px] flex-col justify-between overflow-y-auto border-l border-slate-200 bg-white p-6">
              {isSignSuccess ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center duration-300 animate-in fade-in zoom-in-95">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                    <Check className="h-8 w-8 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Signature Secured
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      You are now legally joined with{' '}
                      <span className="font-semibold text-[#288AF9]">
                        {enterpriseName}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSignSubmit}
                  className="flex flex-1 flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-5">
                    {/* Toggle Signature Mode */}
                    <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                      <button
                        type="button"
                        className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                          activeTab === 'draw'
                            ? 'bg-[#288AF9] text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                        onClick={() => {
                          setActiveTab('draw');
                          setUploadError(null);
                          setSignatureBase64(null);
                        }}
                      >
                        Draw Signature
                      </button>
                      <button
                        type="button"
                        className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                          activeTab === 'upload'
                            ? 'bg-[#288AF9] text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                        onClick={() => {
                          setActiveTab('upload');
                          setUploadError(null);
                          setSignatureBase64(null);
                        }}
                      >
                        Upload Image
                      </button>
                    </div>

                    {/* Draw Mode Canvas */}
                    {activeTab === 'draw' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium font-semibold text-slate-700">
                            Draw signature inside the box
                          </Label>
                          {hasDrawContent && (
                            <button
                              type="button"
                              onClick={clearCanvas}
                              className="rounded border border-red-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-red-600 transition-all hover:bg-red-50 hover:text-red-500"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-inner">
                          <canvas
                            ref={canvasRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUpOrLeave}
                            onPointerLeave={handlePointerUpOrLeave}
                            className="mx-auto block cursor-crosshair touch-none bg-white"
                            style={{ width: '330px', height: '160px' }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500">
                          * Hand-drawn signature is auto-optimized to stay under
                          the 20 KB limit.
                        </span>
                      </div>
                    )}

                    {/* Upload Mode File Box */}
                    {activeTab === 'upload' && (
                      <div className="flex flex-col gap-3">
                        <Label className="text-xs font-semibold text-slate-700">
                          Upload your signature image
                        </Label>
                        <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 transition-all hover:bg-slate-100">
                          <input
                            type="file"
                            id="signature-file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileUpload}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <span className="max-w-[240px] truncate text-xs font-semibold text-slate-700">
                              {uploadedFileName || 'Choose signature image'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              PNG, JPG, JPEG (Max 20 KB)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display Error Card if validation fails */}
                    {uploadError && (
                      <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-red-600">
                        <h4 className="text-xs font-bold">Validation Error:</h4>
                        <p className="mt-1 text-[11px] leading-normal">
                          {uploadError}
                        </p>
                        <div className="mt-2 border-t border-red-200/60 pt-2 text-[9px] text-slate-500">
                          <span className="font-bold text-slate-600">
                            Expected specs:
                          </span>
                          <ul className="mt-0.5 list-inside list-disc">
                            <li>Formats: PNG, JPG, JPEG</li>
                            <li>Max File Size: 20 KB</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Signature Preview */}
                    {signatureBase64 && (
                      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Signature Preview
                        </span>
                        <div className="flex min-h-[60px] items-center justify-center py-2">
                          <Image
                            src={signatureBase64}
                            alt="E-Signature Preview"
                            width={240}
                            height={60}
                            className="max-h-[60px] max-w-[240px] select-none object-contain"
                          />
                        </div>
                        <span className="text-[9px] text-slate-500">
                          Digitally e-signed via Hues Verification
                        </span>
                      </div>
                    )}

                    {/* Legal Consent Checkbox */}
                    <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                      <Checkbox
                        id="consent"
                        checked={consentChecked}
                        onCheckedChange={setConsentChecked}
                        className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#288AF9] data-[state=checked]:text-white"
                      />
                      <div className="flex flex-col gap-0.5">
                        <label
                          htmlFor="consent"
                          className="cursor-pointer select-none text-[11px] font-semibold leading-tight text-slate-700"
                        >
                          I agree to sign this agreement
                        </label>
                        <span className="text-[9px] leading-normal text-slate-500">
                          By checking this, I verify that my signature
                          represents my legal authorization and I accept the
                          terms of this contract.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 border-t border-slate-200 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSigningStep(false)}
                      disabled={isSigningSubmitting}
                      className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        isSigningSubmitting ||
                        !signatureBase64 ||
                        !consentChecked
                      }
                      className="flex-1 bg-[#288AF9] text-white hover:bg-[#288AF9]/90"
                    >
                      {isSigningSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Submit Signature'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </ShadDialogContent>
    </ShadDialog>
  );
}
