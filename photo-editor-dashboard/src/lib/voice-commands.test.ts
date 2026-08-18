import { parseVoiceCommand } from './voice-commands.ts';

const watercolor = parseVoiceCommand('apply watercolor');
if (watercolor?.tool !== 'style-transfer' || watercolor.style !== 'watercolor' || !watercolor.apply) {
  throw new Error('Expected "apply watercolor" to select and apply watercolor style transfer.');
}

const erase = parseVoiceCommand('magic eraser');
if (erase?.tool !== 'magic-eraser' || erase.apply) {
  throw new Error('Expected "magic eraser" to select, but not apply, the mask-dependent tool.');
}
