export type VoiceTool =
  | 'bg-remove'
  | 'bg-replace'
  | 'inpaint'
  | 'outpaint'
  | 'obj-remove'
  | 'face-enhance'
  | 'upscale'
  | 'magic-eraser'
  | 'style-transfer'
  | 'variations';

export type VoiceStyle = 'oil_painting' | 'watercolor' | 'pencil_sketch' | 'cartoon' | 'anime';

export interface VoiceCommand {
  tool?: VoiceTool;
  style?: VoiceStyle;
  apply: boolean;
}

const STYLE_COMMANDS: Array<[string, VoiceStyle]> = [
  ['oil painting', 'oil_painting'],
  ['watercolor', 'watercolor'],
  ['water colour', 'watercolor'],
  ['pencil sketch', 'pencil_sketch'],
  ['cartoon', 'cartoon'],
  ['anime', 'anime'],
];

const TOOL_COMMANDS: Array<[string, VoiceTool, boolean]> = [
  ['remove background', 'bg-remove', true],
  ['background removal', 'bg-remove', true],
  ['replace background', 'bg-replace', false],
  ['background replacement', 'bg-replace', false],
  ['inpainting', 'inpaint', false],
  ['inpaint', 'inpaint', false],
  ['object removal', 'obj-remove', false],
  ['remove object', 'obj-remove', false],
  ['outpainting', 'outpaint', false],
  ['outpaint', 'outpaint', false],
  ['face enhancement', 'face-enhance', true],
  ['enhance face', 'face-enhance', true],
  ['upscale', 'upscale', true],
  ['magic eraser', 'magic-eraser', false],
  ['image variations', 'variations', true],
  ['generate variations', 'variations', true],
];

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const normalized = transcript.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  const explicitApply = normalized === 'apply' || normalized.startsWith('apply ');
  const style = STYLE_COMMANDS.find(([phrase]) => normalized.includes(phrase))?.[1];
  if (style) {
    return { tool: 'style-transfer', style, apply: explicitApply };
  }

  const toolCommand = TOOL_COMMANDS.find(([phrase]) => normalized.includes(phrase));
  if (toolCommand) {
    const [, tool, automaticApply] = toolCommand;
    return { tool, apply: explicitApply || automaticApply };
  }

  return explicitApply ? { apply: true } : null;
}

