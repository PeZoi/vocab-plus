'use client';

import { TagInput } from '@/components/common/tag-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CEFR_SELECT_OPTIONS } from '@/constants/cefr';
import { useUpdateCardMutation } from '@/hooks/features/cards/use-card-mutation';
import type { CardWithProgress, CEFRLevel, PartOfSpeech } from '@/types/card.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';
import { ImageSelector } from './image-selector';

interface CardEditModalProps {
  card: CardWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const editCardSchema = z.object({
  word: z.string().min(1, 'Từ vựng là bắt buộc'),
  definition_en: z.string().optional(),
  definition: z.string().min(1, 'Định nghĩa là bắt buộc'),
  ipa: z.string().optional(),
  example_sentence: z.string().optional(),
  example_translation: z.string().optional(),
  part_of_speech: z.string().optional(),
  cefr_level: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mnemonic: z.string().optional(),
  image_url: z.string().nullable().optional(),
});

type EditCardFormValues = z.infer<typeof editCardSchema>;

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

export function CardEditModal({
  card,
  isOpen,
  onClose,
  onSuccess,
}: CardEditModalProps) {
  const updateCardMutation = useUpdateCardMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<EditCardFormValues>({
    resolver: zodResolver(editCardSchema),
    defaultValues: {
      word: '',
      definition_en: '',
      definition: '',
      ipa: '',
      example_sentence: '',
      example_translation: '',
      part_of_speech: 'noun',
      cefr_level: 'none',
      tags: [],
      mnemonic: '',
      image_url: null,
    },
  });

  const selectedImageUrl = useWatch({ control, name: 'image_url' }) || null;

  useEffect(() => {
    if (card) {
      reset({
        word: card.word,
        definition_en: card.definition_en || '',
        definition: card.definition,
        ipa: card.ipa || '',
        example_sentence: card.example_sentence || '',
        example_translation: card.example_translation || '',
        part_of_speech: card.part_of_speech || 'noun',
        cefr_level: (card.cefr_level as CEFRLevel) || 'none',
        tags: card.tags || [],
        mnemonic: card.mnemonic || '',
        image_url: card.image_url || null,
      });
    }
  }, [card, reset]);

  const onSubmit = async (values: EditCardFormValues) => {
    if (!card) return;

    try {
      await updateCardMutation.mutateAsync({
        id: card.id,
        payload: {
          word: values.word,
          definition_en: values.definition_en || null,
          definition: values.definition,
          ipa: values.ipa || null,
          example_sentence: values.example_sentence || null,
          example_translation: values.example_translation || null,
          part_of_speech: (values.part_of_speech as PartOfSpeech) || null,
          cefr_level: values.cefr_level === 'none' ? null : (values.cefr_level as CEFRLevel) || null,
          tags: values.tags || [],
          image_url: values.image_url || null,
          mnemonic: values.mnemonic || null,
        },
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Lỗi khi cập nhật thẻ:', err);
    }
  };

  if (!card) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={<span>Chỉnh sửa thẻ: <strong className="text-brand">{card.word}</strong></span>}
      description="Cập nhật nghĩa, câu ví dụ, cấp độ CEFR hoặc nhãn phân loại của từ vựng."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Word */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Từ / Cụm từ <span className="text-danger">*</span>
            </label>
            <Input
              {...register('word')}
              className={errors.word ? 'border-danger' : ''}
            />
            {errors.word && (
              <p className="text-xs text-danger mt-1">{errors.word.message}</p>
            )}
          </div>

          {/* Part of Speech */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CEFR Level */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Cấp độ
            </label>
            <Controller
              control={control}
              name="cefr_level"
              render={({ field }) => (
                <Select
                  value={field.value || 'none'}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_SELECT_OPTIONS.map((lvl) => (
                      <SelectItem key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Nhãn phân loại (Tags)
          </label>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Nhập tag và bấm Enter..."
              />
            )}
          />
        </div>

        {/* English Definition */}
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1 flex items-center justify-between">
            <span>Định nghĩa tiếng Anh (English definition)</span>
            <span className="text-[10px] text-brand font-medium">Ưu tiên hiển thị nổi bật</span>
          </label>
          <Textarea
            rows={2}
            placeholder="English definition..."
            {...register('definition_en')}
          />
        </div>

        {/* Definition */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Định nghĩa tiếng Việt <span className="text-danger">*</span>
          </label>
          <Textarea
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
            Câu ví dụ (Tiếng Anh)
          </label>
          <Textarea
            rows={2}
            {...register('example_sentence')}
          />
        </div>

        {/* Example translation */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Dịch câu ví dụ (Tiếng Việt)
          </label>
          <Textarea
            rows={2}
            placeholder="Bản dịch tiếng Việt của câu ví dụ..."
            {...register('example_translation')}
          />
        </div>

        {/* Mnemonic */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Mẹo ghi nhớ (Mnemonic)
          </label>
          <Textarea
            rows={2}
            {...register('mnemonic')}
          />
        </div>

        {/* Image Selector (Pexels Dual-Coding) */}
        <div className="pt-1">
          <ImageSelector
            defaultQuery={card.word}
            selectedImageUrl={selectedImageUrl}
            onSelectImage={(url) => setValue('image_url', url, { shouldDirty: true })}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onClose}
            disabled={updateCardMutation.isPending}
          >
            Hủy
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="default"
            disabled={updateCardMutation.isPending}
            className="gap-1.5"
          >
            {updateCardMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
