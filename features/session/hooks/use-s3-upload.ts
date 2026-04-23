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
          console.log(`[s3] Upload response: status=${xhr.status}, statusText=${xhr.statusText}`);
          console.log(`[s3] Response headers: ${xhr.getAllResponseHeaders()}`);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve({ success: true });
          } else {
            console.error(`[s3] Upload failed with status ${xhr.status}`);
            console.error(`[s3] Response body (full):`, xhr.responseText);
            console.error(`[s3] Response XML:`, xhr.responseXML);
            resolve({ success: false, error: `Upload failed: HTTP ${xhr.status}` });
          }
        };

        xhr.onerror = () => {
          setIsUploading(false);
          console.error(`[s3] Upload error: readyState=${xhr.readyState}, status=${xhr.status}, statusText=${xhr.statusText}`);
          resolve({ success: false, error: "Network error during upload." });
        };

        xhr.onabort = () => {
          setIsUploading(false);
          console.error("[s3] Upload aborted");
          resolve({ success: false, error: "Upload aborted." });
        };

        console.log(`[s3] Starting upload: url=${presignedUrl.substring(0, 100)}..., blob size=${blob.size}, type=${blob.type}`);
        console.log(`[s3] Full URL (first 200 chars): ${presignedUrl.substring(0, 200)}`);
        console.log(`[s3] Content-Type header: ${blob.type || "audio/webm"}`);
        
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", blob.type || "audio/webm");
        
        // Log all request headers
        console.log(`[s3] Request method: PUT`);
        console.log(`[s3] Sending blob...`);
        
        xhr.send(blob);
      });
    },
    [onProgress]
  );

  return { upload, isUploading, progress };
}
