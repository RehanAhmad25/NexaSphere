import { useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { isIOS } from '../utils/deviceDetection';
import { generatePDFBlob } from '../utils/certificateDownload';

export interface UseCertificateExportOptions {
  content: () => HTMLElement | null;
  documentTitle?: string;
  onBeforeGetContent?: () => Promise<void> | void;
  onAfterPrint?: () => void;
  removeAfterPrint?: boolean;
}

export const useCertificateExport = (options: UseCertificateExportOptions) => {
  const [isExporting, setIsExporting] = useState(false);
  const isIOSDevice = isIOS();

  // Setup standard react-to-print hook for non-iOS devices
  const handleReactToPrint = useReactToPrint({
    content: options.content,
    documentTitle: options.documentTitle,
    onBeforeGetContent: async () => {
      setIsExporting(true);
      if (options.onBeforeGetContent) {
        await options.onBeforeGetContent();
      }
    },
    onAfterPrint: () => {
      setIsExporting(false);
      if (options.onAfterPrint) {
        options.onAfterPrint();
      }
    },
    removeAfterPrint: options.removeAfterPrint ?? true,
    // Add print error handling to not get stuck in exporting state
    onPrintError: () => {
      setIsExporting(false);
      if (options.onAfterPrint) {
        options.onAfterPrint();
      }
    },
  } as any);

  const handlePrint = useCallback(async () => {
    if (!isIOSDevice) {
      // Use native fast print on Desktop/Android
      handleReactToPrint();
      return;
    }

    // iOS Fallback Flow
    const element = options.content();
    if (!element) return;

    try {
      setIsExporting(true);
      if (options.onBeforeGetContent) {
        await options.onBeforeGetContent();
      }

      // Small delay to ensure any state updates from onBeforeGetContent have rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      await generatePDFBlob(element, `${options.documentTitle || 'export'}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Could show a toast notification here in a real app
    } finally {
      setIsExporting(false);
      if (options.onAfterPrint) {
        options.onAfterPrint();
      }
    }
  }, [isIOSDevice, handleReactToPrint, options]);

  return {
    handlePrint,
    isExporting,
  };
};
