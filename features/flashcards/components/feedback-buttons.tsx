import { ReviewDifficulty } from "../types";
import { SRSControls } from "./srs-controls";

interface FeedbackButtonsProps {
  onRate: (difficulty: ReviewDifficulty, key?: string) => void;
  disabled?: boolean;
  activeKey: string | null;
}

export function FeedbackButtons(props: FeedbackButtonsProps) {
  return <SRSControls {...props} />;
}
