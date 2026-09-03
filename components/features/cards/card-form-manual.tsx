'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCardMutation } from '@/hooks/features/cards/use-card-mutation';
import { PartOfSpeech } from '@/types/card.types';
import { Loader2, CheckCircle2, Plus } from 'lucide-react';

const manualCardSchema = z.object({
  word: z.string().min(1, 'Từ vựng là bắt buộc'),
  part_of_speech: z.string().optional(),
  ipa: z.string().optional(),
  definition: z.string().min(1, 'Nghĩa của từ là bắt buộc'),
  example_sentence: z.string().optional(),
  mnemonic: z.string().optional(),
});

type ManualCardFormValues = z.infer<typeof manualCardSchema>;

const PARTS_OF_SPEECH: { value: PartOfSpeech; label: string }[] = [
  { value: 'noun', label: 'Danh từ (noun)' },
  { value: 'verb', label: 'Động từ (verb)' },
  { value: 'adjective', label: 'Tính từ (adj)' },
  { value: 'adverb', label: 'Trạng từ (adv)' },
  { value: 'preposition', label: 'Giới từ (prep)' },
  { value: 'conjunction', label: 'Liên từ (conj)' },
  { value: 'pronoun', label: 'Đại từ (pron)' },
  { value: 'interjection', label: 'Thán từ (int)' },
];

export function CardFormManual({ onSuccess }: { onSuccess?: () => void }) {
  const [successMessage, setSuccessMessage] = React.useState(false);
  const createCardMutation = useCreateCardMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ManualCardFormValues>({
    resolver: zodResolver(manualCardSchema),
    defaultValues: {
      word: '',
      part_of_speech: 'noun',
      ipa: '',
      definition: '',
      example_sentence: '',
      mnemonic: '',
    },
  });

  const onSubmit = async (values: ManualCardFormValues) => {
    try {
      await createCardMutation.mutateAsync({
        word: values.word,
        definition: values.definition,
        ipa: values.ipa || null,
        example_sentence: values.example_sentence || null,
        part_of_speech: (values.part_of_speech as PartOfSpeech) || null,
        mnemonic: values.mnemonic || null,
        source_type: 'manual',
      });

      setSuccessMessage(true);
      reset();
      setTimeout(() => setSuccessMessage(false), 3000);
      onSuccess?.();
    } catch (err) {
      console.error('Lỗi khi lưu thẻ:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/15 border border-success/30 text-success text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Đã thêm thẻ từ vựng mới thành công!</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Word */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Từ hoặc cụm từ <span className="text-danger">*</span>
          </label>
          <Input
            placeholder="vd: resilient"
            {...register('word')}
            className={errors.word ? 'border-danger' : ''}
          />
          {errors.word && (
            <p className="text-xs text-danger mt-1">{errors.word.message}</p>
          )}
        </div>

        {/* Part of speech */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Từ loại
          </label>
          <Controller
            control={control}
            name="part_of_speech"
            render={({ field }) => (
              <Select
                value={field.value || 'noun'}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn từ loại" />
                </SelectTrigger>
                <SelectContent>
                  {PARTS_OF_SPEECH.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* IPA */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Phiên âm IPA
        </label>
        <Input
          placeholder="vd: /rɪˈzɪl.jənt/"
          {...register('ipa')}
        />
      </div>

      {/* Definition */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Định nghĩa tiếng Việt <span className="text-danger">*</span>
        </label>
        <Textarea
          placeholder="vd: kiên cường, có khả năng phục hồi nhanh sau khó khăn"
          rows={2}
          {...register('definition')}
          className={errors.definition ? 'border-danger' : ''}
        />
        {errors.definition && (
          <p className="text-xs text-danger mt-1">{errors.definition.message}</p>
        )}
      </div>

      {/* Example sentence */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Câu ví dụ
        </label>
        <Textarea
          placeholder="vd: She is very resilient and never gives up."
          rows={2}
          {...register('example_sentence')}
        />
      </div>

      {/* Mnemonic */}
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Mẹo ghi nhớ (Mnemonic)
        </label>
        <Textarea
          placeholder="vd: liên tưởng hình ảnh hoặc mẹo nhớ vui"
          rows={2}
          {...register('mnemonic')}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="default"
          disabled={createCardMutation.isPending}
          className="w-full gap-1.5"
        >
          {createCardMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu từ vựng...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Lưu vào bộ thẻ của tôi</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
