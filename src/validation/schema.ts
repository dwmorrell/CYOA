import Ajv from 'ajv';
import schema from '../../schemas/story.schema.json';
import type { Story } from '../engine/types';

const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile<Story>(schema);

export interface SchemaResult {
  ok: boolean;
  errors: string[];
}

export function validateSchema(data: unknown): SchemaResult {
  const ok = validate(data);
  return {
    ok,
    errors: ok ? [] : (validate.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message ?? 'is invalid'}`),
  };
}

export function isStory(data: unknown): data is Story {
  return validate(data);
}
