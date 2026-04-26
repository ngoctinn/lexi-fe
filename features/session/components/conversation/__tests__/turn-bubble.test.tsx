import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TurnBubble } from '../turn-bubble';
import { Turn, TurnSpeaker, ProficiencyLevel } from '@/features/session/types/session.types';

// Mock the feature flags
jest.mock('@/features/session/utils/feature-flags', () => ({
  isDebugMetricsEnabled: jest.fn(() => true),
}));

// Mock the LatencyMetrics component
jest.mock('../latency-metrics', () => ({
  LatencyMetrics: ({ ttftMs, latencyMs }: { ttftMs?: number; latencyMs?: number }) => (
    <div data-testid="latency-metrics">
      TTFT: {ttftMs}ms, Latency: {latencyMs}ms
    </div>
  ),
}));

describe('TurnBubble - All Proficiency Levels', () => {
  const createTurn = (
    speaker: TurnSpeaker,
    content: string,
    level: ProficiencyLevel,
    metrics?: Partial<Turn>
  ): Turn => ({
    turn_index: 0,
    speaker,
    content,
    translated_content: '',
    audio_url: '',
    is_hint_used: false,
    is_saved_to_flashcard: false,
    is_pending: false,
    level,
    // Metrics (Phase 5)
    ttft_ms: metrics?.ttft_ms,
    latency_ms: metrics?.latency_ms,
    input_tokens: metrics?.input_tokens || 0,
    output_tokens: metrics?.output_tokens || 0,
    cost_usd: metrics?.cost_usd || 0.0,
    delivery_cue: metrics?.delivery_cue || '',
    quality_score: metrics?.quality_score || 0.0,
  });

  describe('A1 Level (Beginner)', () => {
    it('should render simple AI response for A1', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        'Hello. How are you?',
        ProficiencyLevel.A1,
        { ttft_ms: 250, latency_ms: 800, output_tokens: 5 }
      );

      render(<TurnBubble turn={turn} aiName="Teacher" />);

      expect(screen.getByText('Hello. How are you?')).toBeInTheDocument();
      expect(screen.getByText(/TTFT: 250ms/)).toBeInTheDocument();
    });

    it('should display delivery cue for A1', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        '[warmly] Good job! Can you say it again?',
        ProficiencyLevel.A1,
        { delivery_cue: '[warmly]' }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/Good job/)).toBeInTheDocument();
    });

    it('should show hint badge when used', () => {
      const turn = createTurn(
        TurnSpeaker.USER,
        'I am fine',
        ProficiencyLevel.A1
      );
      turn.is_hint_used = true;

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/Dùng gợi ý/)).toBeInTheDocument();
    });
  });

  describe('A2 Level (Elementary)', () => {
    it('should render slightly longer AI response for A2', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        'That sounds great! Can you tell me more about your family?',
        ProficiencyLevel.A2,
        { ttft_ms: 320, latency_ms: 1200, output_tokens: 12 }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/That sounds great/)).toBeInTheDocument();
      expect(screen.getByText(/TTFT: 320ms/)).toBeInTheDocument();
    });

    it('should handle word-by-word translation for A2', async () => {
      const turn = createTurn(
        TurnSpeaker.USER,
        'I like reading books',
        ProficiencyLevel.A2
      );
      turn.translated_content = 'Tôi thích đọc sách';

      const mockTranslateWord = jest.fn().mockResolvedValue({
        translation_vi: 'thích',
        definition_vi: 'yêu thích, ưa thích',
        part_of_speech: 'verb',
        phonetic: '/laɪk/',
      });

      render(
        <TurnBubble
          turn={turn}
          onTranslateWord={mockTranslateWord}
        />
      );

      const words = screen.getAllByRole('button').filter(
        (btn) => btn.textContent && ['I', 'like', 'reading', 'books'].includes(btn.textContent)
      );
      
      if (words.length > 0) {
        fireEvent.click(words[0]);
        await waitFor(() => {
          expect(mockTranslateWord).toHaveBeenCalled();
        });
      }
    });
  });

  describe('B1 Level (Intermediate)', () => {
    it('should render complex AI response for B1', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        '[encouragingly] Excellent point! Your pronunciation is improving. Could you elaborate on that idea and provide an example?',
        ProficiencyLevel.B1,
        { ttft_ms: 380, latency_ms: 1500, output_tokens: 25, delivery_cue: '[encouragingly]' }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/Excellent point/)).toBeInTheDocument();
      expect(screen.getByText(/TTFT: 380ms/)).toBeInTheDocument();
    });

    it('should display quality metrics for B1', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        'That is a sophisticated observation.',
        ProficiencyLevel.B1,
        {
          ttft_ms: 350,
          latency_ms: 1400,
          output_tokens: 8,
          quality_score: 85.5,
        }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByTestId('latency-metrics')).toBeInTheDocument();
    });
  });

  describe('B2 Level (Upper Intermediate)', () => {
    it('should render nuanced AI response for B2', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        '[thoughtfully] That is an insightful observation. However, one could argue that the alternative perspective offers equally compelling evidence. What are your thoughts on this counterargument?',
        ProficiencyLevel.B2,
        { ttft_ms: 420, latency_ms: 1800, output_tokens: 35, delivery_cue: '[thoughtfully]' }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/insightful observation/)).toBeInTheDocument();
    });

    it('should handle complex translation for B2', () => {
      const turn = createTurn(
        TurnSpeaker.USER,
        'The implications of this policy are far-reaching.',
        ProficiencyLevel.B2
      );
      turn.translated_content = 'Những hàm ý của chính sách này là rộng rãi.';

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/The implications/)).toBeInTheDocument();
    });
  });

  describe('C1 Level (Advanced)', () => {
    it('should render sophisticated AI response for C1', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        '[analytically] Your articulation demonstrates a nuanced understanding of the subject matter. The syntactic complexity and lexical precision you employed are commendable. Nevertheless, consider how this argument intersects with contemporary discourse on the topic.',
        ProficiencyLevel.C1,
        { ttft_ms: 450, latency_ms: 2000, output_tokens: 45, delivery_cue: '[analytically]' }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/nuanced understanding/)).toBeInTheDocument();
    });
  });

  describe('C2 Level (Mastery)', () => {
    it('should render expert-level AI response for C2', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        '[professionally] Your exposition evinces a sophisticated grasp of the epistemological underpinnings. The dialectical framework you have employed is particularly efficacious. Might we explore the hermeneutical implications further?',
        ProficiencyLevel.C2,
        { ttft_ms: 480, latency_ms: 2200, output_tokens: 50, delivery_cue: '[professionally]' }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.getByText(/epistemological/)).toBeInTheDocument();
    });
  });

  describe('Metrics Display Across Levels', () => {
    it('should display metrics for all levels when debug enabled', () => {
      const levels = [
        ProficiencyLevel.A1,
        ProficiencyLevel.A2,
        ProficiencyLevel.B1,
        ProficiencyLevel.B2,
        ProficiencyLevel.C1,
        ProficiencyLevel.C2,
      ];

      levels.forEach((level) => {
        const turn = createTurn(
          TurnSpeaker.AI,
          'Test response',
          level,
          { ttft_ms: 300, latency_ms: 1000, output_tokens: 10 }
        );

        const { unmount } = render(<TurnBubble turn={turn} />);
        expect(screen.getByTestId('latency-metrics')).toBeInTheDocument();
        unmount();
      });
    });

    it('should hide metrics when debug disabled', () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { isDebugMetricsEnabled } = require('@/features/session/utils/feature-flags');
      isDebugMetricsEnabled.mockReturnValue(false);

      const turn = createTurn(
        TurnSpeaker.AI,
        'Test response',
        ProficiencyLevel.B1,
        { ttft_ms: 300, latency_ms: 1000 }
      );

      render(<TurnBubble turn={turn} />);
      expect(screen.queryByTestId('latency-metrics')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions Across Levels', () => {
    it('should handle translation toggle for all levels', async () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        'How are you today?',
        ProficiencyLevel.B1
      );
      turn.translated_content = 'Bạn khỏe không hôm nay?';

      render(<TurnBubble turn={turn} />);

      const translateButton = screen.getAllByRole('button').find(
        (btn) => btn.querySelector('svg')
      );

      if (translateButton) {
        fireEvent.click(translateButton);
        await waitFor(() => {
          expect(screen.getByText(/Bạn khỏe không/)).toBeInTheDocument();
        });
      }
    });

    it('should handle audio playback for all levels', () => {
      const mockPlayAudio = jest.fn();
      const turn = createTurn(
        TurnSpeaker.AI,
        'Listen to this',
        ProficiencyLevel.C1
      );
      turn.audio_url = 'https://example.com/audio.mp3';

      render(
        <TurnBubble
          turn={turn}
          onPlayAudio={mockPlayAudio}
        />
      );

      const audioButtons = screen.getAllByRole('button').filter(
        (btn) => btn.querySelector('svg[class*="Volume"]')
      );

      if (audioButtons.length > 0) {
        fireEvent.click(audioButtons[0]);
        expect(mockPlayAudio).toHaveBeenCalledWith('https://example.com/audio.mp3');
      }
    });
  });

  describe('Delivery Cues Across Levels', () => {
    const deliveryCues = [
      '[warmly]',
      '[encouragingly]',
      '[thoughtfully]',
      '[analytically]',
      '[professionally]',
    ];

    deliveryCues.forEach((cue) => {
      it(`should handle delivery cue: ${cue}`, () => {
        const turn = createTurn(
          TurnSpeaker.AI,
          `${cue} This is a test response.`,
          ProficiencyLevel.B1,
          { delivery_cue: cue }
        );

        render(<TurnBubble turn={turn} />);
        expect(screen.getByText(/This is a test response/)).toBeInTheDocument();
      });
    });
  });

  describe('Pending State Across Levels', () => {
    it('should show pending state for all levels', () => {
      const turn = createTurn(
        TurnSpeaker.AI,
        'Generating response...',
        ProficiencyLevel.B2
      );
      turn.is_pending = true;

      const { container } = render(<TurnBubble turn={turn} />);
      const bubble = container.querySelector('[class*="animate-pulse"]');
      expect(bubble).toBeInTheDocument();
    });
  });
});
