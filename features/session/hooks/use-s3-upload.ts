"use client";

import * as React from "react";

interface UseS3UploadOptions {
  onProgress?: (percent: number) => void;
}

interface UseS3UploadReturn {
  upload: (presignedUrl: string, blob: Blob) => Promise<{ success: boolean; error?: string }>;
  isUploading: boolean;
  progress: number;
}

export function useS3Upload({ onProgress }: UseS3UploadOptions = {}): UseS3UploadReturn {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const upload = React.useCallback(
    async (presignedUrl: string, blob: Blob): Promise<{ success: boolean; error?: string }> => {
      setIsUploading(true);
      setProgress(0);

      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setProgress(pct);
            onProgress?.(pct);
          }
        };

        xhr.onload = () => {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve({ success: true });
          } else {
            resolve({ success: false, error: `Upload failed: HTTP ${xhr.status}` });
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          resolve({ success: false, error: "Network error during upload." });
        };

        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", blob.type);
        xhr.send(blob);
      });
    },
    [onProgress]
  );

  return { upload, isUploading, progress };
}
