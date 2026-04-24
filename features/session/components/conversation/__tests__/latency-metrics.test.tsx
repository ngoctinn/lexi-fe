import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LatencyMetrics } from '../latency-metrics';

describe('LatencyMetrics - All Proficiency Levels', () => {
  describe('Rendering', () => {
    it('should render debug metrics button', () => {
      render(
        <LatencyMetrics
          ttftMs={250}
          latencyMs={800}
          inputTokens={15}
          outputTokens={25}
          costUsd={0.0012}
          qualityScore={85.5}
        />
      );

      expect(screen.getByText('Debug Metrics')).toBeInTheDocument();
    });

    it('should expand and show all metrics when provided', () => {
      render(
        <LatencyMetrics
          ttftMs={250}
          latencyMs={800}
          inputTokens={15}
          outputTokens={25}
          costUsd={0.0012}
          qualityScore={85.5}
        />
      );

      // Click to expand
      fireEvent.click(screen.getByText('Debug Metrics'));

      // Now metrics should be visible
      expect(screen.getByText(/TTFT:/)).toBeInTheDocument();
      expect(screen.getByText(/Latency:/)).toBeInTheDocument();
      expect(screen.getByText(/Input tokens:/)).toBeInTheDocument();
      expect(screen.getByText(/Output tokens:/)).toBeInTheDocument();
      expect(screen.getByText(/Cost:/)).toBeInTheDocument();
      expect(screen.getByText(/Quality:/)).toBeInTheDocument();
    });

    it('should handle undefined metrics gracefully', () => {
      render(
        <LatencyMetrics
          ttftMs={undefined}
          latencyMs={undefined}
          inputTokens={0}
          outputTokens={0}
          costUsd={0}
          qualityScore={0}
        />
      );

      // Should not render anything if no metrics
      expect(screen.queryByText('Debug Metrics')).not.toBeInTheDocument();
    });

    it('should render zero values correctly', () => {
      render(
        <LatencyMetrics
          ttftMs={0}
          latencyMs={0}
          inputTokens={0}
          outputTokens={0}
          costUsd={0}
          qualityScore={0}
        />
      );

      // Should not render if all values are 0 or undefined
      expect(screen.queryByText('Debug Metrics')).not.toBeInTheDocument();
    });
  });

  describe('A1 Level Metrics', () => {
    it('should display fast TTFT for A1 (simple responses)', () => {
      render(
        <LatencyMetrics
          ttftMs={200}
          latencyMs={600}
          inputTokens={10}
          outputTokens={8}
          costUsd={0.0008}
          qualityScore={78}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/TTFT:/)).toBeInTheDocument();
      expect(screen.getByText(/200ms/)).toBeInTheDocument();
      expect(screen.getByText(/600ms/)).toBeInTheDocument();
    });
  });

  describe('B1 Level Metrics', () => {
    it('should display moderate TTFT for B1 (medium responses)', () => {
      render(
        <LatencyMetrics
          ttftMs={350}
          latencyMs={1400}
          inputTokens={20}
          outputTokens={25}
          costUsd={0.0015}
          qualityScore={82}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/350ms/)).toBeInTheDocument();
      expect(screen.getByText(/1400ms/)).toBeInTheDocument();
    });
  });

  describe('C1 Level Metrics', () => {
    it('should display higher TTFT for C1 (complex responses)', () => {
      render(
        <LatencyMetrics
          ttftMs={450}
          latencyMs={2000}
          inputTokens={30}
          outputTokens={45}
          costUsd={0.0025}
          qualityScore={88}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/450ms/)).toBeInTheDocument();
      expect(screen.getByText(/2000ms/)).toBeInTheDocument();
    });
  });

  describe('Cost Calculation', () => {
    it('should display cost in USD format', () => {
      render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.00125}
          qualityScore={80}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/\$0\.0013/)).toBeInTheDocument();
    });

    it('should handle very small costs', () => {
      render(
        <LatencyMetrics
          ttftMs={250}
          latencyMs={800}
          inputTokens={5}
          outputTokens={5}
          costUsd={0.0001}
          qualityScore={75}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/\$0\.0001/)).toBeInTheDocument();
    });

    it('should handle larger costs', () => {
      render(
        <LatencyMetrics
          ttftMs={500}
          latencyMs={2500}
          inputTokens={50}
          outputTokens={100}
          costUsd={0.05}
          qualityScore={90}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/\$0\.0500/)).toBeInTheDocument();
    });
  });

  describe('Quality Score Display', () => {
    it('should display quality score as percentage', () => {
      render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.0012}
          qualityScore={85.5}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/85\.5\/100/)).toBeInTheDocument();
    });

    it('should handle perfect quality score', () => {
      render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.0012}
          qualityScore={100}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/100\.0\/100/)).toBeInTheDocument();
    });

    it('should handle low quality score', () => {
      render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.0012}
          qualityScore={45}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/45\.0\/100/)).toBeInTheDocument();
    });
  });

  describe('Token Count Display', () => {
    it('should display input and output tokens', () => {
      render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={25}
          outputTokens={35}
          costUsd={0.0012}
          qualityScore={80}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/Input tokens:/)).toBeInTheDocument();
      expect(screen.getByText(/Output tokens:/)).toBeInTheDocument();
    });

    it('should handle large token counts', () => {
      render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={500}
          outputTokens={1000}
          costUsd={0.05}
          qualityScore={80}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/500/)).toBeInTheDocument();
      expect(screen.getByText(/1000/)).toBeInTheDocument();
    });
  });

  describe('Latency Metrics', () => {
    it('should display TTFT and total latency', () => {
      render(
        <LatencyMetrics
          ttftMs={250}
          latencyMs={1200}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.0012}
          qualityScore={80}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/250ms/)).toBeInTheDocument();
      expect(screen.getByText(/1200ms/)).toBeInTheDocument();
    });

    it('should handle very fast responses', () => {
      render(
        <LatencyMetrics
          ttftMs={50}
          latencyMs={200}
          inputTokens={5}
          outputTokens={5}
          costUsd={0.0001}
          qualityScore={70}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/50ms/)).toBeInTheDocument();
      expect(screen.getByText(/200ms/)).toBeInTheDocument();
    });

    it('should handle slow responses', () => {
      render(
        <LatencyMetrics
          ttftMs={800}
          latencyMs={3000}
          inputTokens={100}
          outputTokens={150}
          costUsd={0.1}
          qualityScore={85}
        />
      );

      fireEvent.click(screen.getByText('Debug Metrics'));
      expect(screen.getByText(/800ms/)).toBeInTheDocument();
      expect(screen.getByText(/3000ms/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button for expanding metrics', () => {
      const { container } = render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.0012}
          qualityScore={80}
        />
      );

      const button = screen.getByText('Debug Metrics');
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Responsive Design', () => {
    it('should render metrics in a compact format', () => {
      const { container } = render(
        <LatencyMetrics
          ttftMs={300}
          latencyMs={1000}
          inputTokens={15}
          outputTokens={20}
          costUsd={0.0012}
          qualityScore={80}
        />
      );

      // Should have a container
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
