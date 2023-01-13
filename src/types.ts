export interface CompletionChoice {
  text: string;
  index: number;
  logprobs: null | {
      tokens: string[];
      token_logprobs: number[];
      top_logprobs: Record<string, number>[];
      text_offset: number[];
  };
  finish_reason: string;
}