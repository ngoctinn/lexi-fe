/**
 * AWS Event Stream Encoding for Transcribe WebSocket
 * 
 * Reference: https://docs.aws.amazon.com/transcribe/latest/dg/streaming-setting-up.html#streaming-event-stream
 * 
 * Event stream format:
 * - Prelude (12 bytes):
 *   - Total byte length (4 bytes, big-endian)
 *   - Headers byte length (4 bytes, big-endian)
 *   - Prelude CRC (4 bytes, big-endian)
 * - Headers (variable length)
 * - Payload (variable length)
 * - Message CRC (4 bytes, big-endian)
 */

/**
 * CRC32 implementation (IEEE 802.3 polynomial)
 * Used for AWS event stream encoding
 */
function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Encode a header in AWS event stream format
 */
function encodeHeader(name: string, value: string): Uint8Array {
  const nameBytes = new TextEncoder().encode(name);
  const valueBytes = new TextEncoder().encode(value);
  
  const header = new Uint8Array(1 + nameBytes.length + 1 + 2 + valueBytes.length);
  let offset = 0;
  
  // Header name length (1 byte)
  header[offset++] = nameBytes.length;
  
  // Header name
  header.set(nameBytes, offset);
  offset += nameBytes.length;
  
  // Header value type (7 = string)
  header[offset++] = 7;
  
  // Header value length (2 bytes, big-endian)
  header[offset++] = (valueBytes.length >> 8) & 0xFF;
  header[offset++] = valueBytes.length & 0xFF;
  
  // Header value
  header.set(valueBytes, offset);
  
  return header;
}

/**
 * Encode audio data in AWS event stream format for Transcribe
 * 
 * AWS Event Stream Format:
 * - Prelude (12 bytes):
 *   - Total length (4 bytes, big-endian)
 *   - Headers length (4 bytes, big-endian)
 *   - Prelude CRC (4 bytes, big-endian CRC32 of first 8 bytes)
 * - Headers (variable)
 * - Payload (variable)
 * - Message CRC (4 bytes, big-endian CRC32 of everything except message CRC)
 * 
 * @param audioData - PCM audio data (Int16 as Uint8Array)
 * @returns Encoded event stream message
 */
export function encodeAudioEvent(audioData: Uint8Array): Uint8Array {
  // Build headers
  const headers: Uint8Array[] = [
    encodeHeader(":content-type", "application/octet-stream"),
    encodeHeader(":event-type", "AudioEvent"),
    encodeHeader(":message-type", "event"),
  ];
  
  // Calculate total headers length
  const headersLength = headers.reduce((sum, h) => sum + h.length, 0);
  const headersArray = new Uint8Array(headersLength);
  let offset = 0;
  for (const header of headers) {
    headersArray.set(header, offset);
    offset += header.length;
  }
  
  // Calculate total message length
  // Total = prelude(8) + prelude_crc(4) + headers + payload + message_crc(4)
  const payloadLength = audioData.length;
  const totalLength = 8 + 4 + headersLength + payloadLength + 4;
  
  // Allocate message buffer
  const message = new Uint8Array(totalLength);
  const view = new DataView(message.buffer);
  
  // Write prelude (8 bytes)
  view.setUint32(0, totalLength, false); // Total byte length (big-endian)
  view.setUint32(4, headersLength, false); // Headers byte length (big-endian)
  
  // Calculate and write prelude CRC (4 bytes)
  const preludeCrc = crc32(message.slice(0, 8));
  view.setUint32(8, preludeCrc, false);
  
  // Write headers (after prelude + prelude CRC)
  message.set(headersArray, 12);
  
  // Write payload (after prelude + prelude CRC + headers)
  if (payloadLength > 0) {
    message.set(audioData, 12 + headersLength);
  }
  
  // Calculate and write message CRC (last 4 bytes)
  // Message CRC covers everything except the message CRC itself
  const messageCrc = crc32(message.slice(0, totalLength - 4));
  view.setUint32(totalLength - 4, messageCrc, false);
  
  return message;
}

/**
 * Parse AWS Transcribe event stream response
 * 
 * @param data - Raw event stream data from Transcribe WebSocket
 * @returns Parsed transcript result or null if not a transcript event
 */
export function parseTranscriptEvent(data: ArrayBuffer): {
  text: string;
  confidence: number;
  isPartial: boolean;
} | null {
  try {
    const view = new DataView(data);
    
    // Read prelude
    const totalLength = view.getUint32(0, false);
    const headersLength = view.getUint32(4, false);
    const preludeCrc = view.getUint32(8, false);
    
    // Verify prelude CRC
    const preludeData = new Uint8Array(data, 0, 8);
    const calculatedPreludeCrc = crc32(preludeData);
    if (calculatedPreludeCrc !== preludeCrc) {
      console.warn("[EventStream] Prelude CRC mismatch");
    }
    
    // Parse headers
    let offset = 12;
    const headersEnd = offset + headersLength;
    let eventType = "";
    let exceptionType = "";
    let messageType = "";
    
    while (offset < headersEnd) {
      const headerNameLen = view.getUint8(offset);
      offset += 1;
      
      const headerName = new TextDecoder().decode(new Uint8Array(data, offset, headerNameLen));
      offset += headerNameLen;
      
      const headerValueType = view.getUint8(offset);
      offset += 1;
      
      let headerValueLen = 0;
      if (headerValueType === 7) {
        headerValueLen = view.getUint16(offset, false);
        offset += 2;
      }
      
      const headerValue = new TextDecoder().decode(new Uint8Array(data, offset, headerValueLen));
      
      if (headerName === ":event-type") {
        eventType = headerValue;
      } else if (headerName === ":exception-type") {
        exceptionType = headerValue;
      } else if (headerName === ":message-type") {
        messageType = headerValue;
      }
      
      offset += headerValueLen;
    }
    
    // Verify message CRC
    const messageCrc = view.getUint32(totalLength - 4, false);
    const messageData = new Uint8Array(data, 0, totalLength - 4);
    const calculatedMessageCrc = crc32(messageData);
    if (calculatedMessageCrc !== messageCrc) {
      console.warn("[EventStream] Message CRC mismatch");
    }
    
    // Parse payload
    const payloadStart = headersEnd;
    const payloadEnd = totalLength - 4;
    const payloadLength = payloadEnd - payloadStart;
    
    if (payloadLength > 0) {
      const payload = new Uint8Array(data, payloadStart, payloadLength);
      const jsonStr = new TextDecoder().decode(payload);
      
      // Handle exceptions
      if (messageType === "exception") {
        console.error("[EventStream] AWS Exception:", exceptionType, jsonStr);
        return null;
      }
      
      // Handle transcript events
      if (eventType === "TranscriptEvent") {
        const transcriptEvent = JSON.parse(jsonStr);
        
        if (transcriptEvent.Transcript?.Results) {
          for (const result of transcriptEvent.Transcript.Results) {
            if (result.Alternatives && result.Alternatives.length > 0) {
              const alternative = result.Alternatives[0];
              const text = alternative.Transcript || "";
              const isPartial = result.IsPartial || false;
              
              // Calculate average confidence
              const items = alternative.Items || [];
              const confidences = items
                .map((item: { Confidence?: number }) => item.Confidence)
                .filter((c: number | undefined): c is number => c !== undefined);
              const avgConfidence =
                confidences.length > 0
                  ? confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length
                  : 1.0;
              
              return { text, confidence: avgConfidence, isPartial };
            }
          }
        }
      }
    }
    
    return null;
  } catch (err) {
    console.error("[EventStream] Failed to parse event:", err);
    return null;
  }
}
