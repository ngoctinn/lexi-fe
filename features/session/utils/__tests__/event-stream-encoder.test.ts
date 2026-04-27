import { describe, it, expect } from 'vitest';
import { encodeAudioEvent } from '../event-stream-encoder';

describe('Event Stream Encoder', () => {
  it('should encode empty audio event correctly', () => {
    const emptyAudio = new Uint8Array(0);
    const encoded = encodeAudioEvent(emptyAudio);
    
    // Check structure
    const view = new DataView(encoded.buffer);
    const totalLength = view.getUint32(0, false);
    const headersLength = view.getUint32(4, false);
    
    console.log('Empty audio event:', {
      totalLength,
      headersLength,
      encodedLength: encoded.length,
    });
    
    // Total length should match encoded length
    expect(totalLength).toBe(encoded.length);
    
    // Headers should be present
    expect(headersLength).toBeGreaterThan(0);
    
    // Structure: prelude(8) + prelude_crc(4) + headers + payload(0) + message_crc(4)
    expect(totalLength).toBe(8 + 4 + headersLength + 0 + 4);
  });
  
  it('should encode audio event with data correctly', () => {
    // Create 1 second of silence @ 16kHz (32000 bytes for Int16)
    const audioData = new Uint8Array(32000);
    const encoded = encodeAudioEvent(audioData);
    
    const view = new DataView(encoded.buffer);
    const totalLength = view.getUint32(0, false);
    const headersLength = view.getUint32(4, false);
    
    console.log('Audio event with data:', {
      totalLength,
      headersLength,
      payloadLength: audioData.length,
      encodedLength: encoded.length,
    });
    
    // Total length should match
    expect(totalLength).toBe(encoded.length);
    
    // Structure check
    expect(totalLength).toBe(8 + 4 + headersLength + audioData.length + 4);
  });
});
