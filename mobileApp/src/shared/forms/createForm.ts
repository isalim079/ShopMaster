import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

type ZodFormSchema<TInput extends FieldValues, TOutput extends FieldValues> =
  z.ZodType<TOutput, TInput>;

/**
 * Typed useForm helper for Zod schemas with transforms (e.g. zNum).
 * Form state / TextInputs use z.input; handleSubmit receives z.output.
 */
export function useZodForm<
  TInput extends FieldValues,
  TOutput extends FieldValues,
>(
  schema: ZodFormSchema<TInput, TOutput>,
  props?: Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'> & {
    defaultValues?: DefaultValues<TInput>;
  },
): UseFormReturn<TInput, unknown, TOutput> {
  return useForm<TInput, unknown, TOutput>({
    ...props,
    resolver: zodResolver(schema),
  });
}
