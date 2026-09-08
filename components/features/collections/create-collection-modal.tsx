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
import { COLLECTION_CATEGORIES } from '@/constants/categories';
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
} from '@/hooks/features/collections/use-collections';
import type { Collection, CollectionCategory } from '@/types/collection.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Loader2, Lock } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

const collectionSchema = z.object({
  title: z.string().min(1, 'Tên bộ từ vựng là bắt buộc'),
  description: z.string().optional(),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  is_public: z.boolean(),
  tags: z.array(z.string()).optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit?: Collection | null;
  onSuccess?: (col: Collection) => void;
}

export function CreateCollectionModal({
  isOpen,
  onClose,
  collectionToEdit,
  onSuccess,
}: CreateCollectionModalProps) {
  const isEditing = !!collectionToEdit;
  const createMutation = useCreateCollectionMutation();
  const updateMutation = useUpdateCollectionMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      is_public: false,
      tags: [],
    },
  });

  const isPublic = useWatch({ control, name: 'is_public' });

  useEffect(() => {
    if (collectionToEdit) {
      reset({
        title: collectionToEdit.title,
        description: collectionToEdit.description || '',
        category: collectionToEdit.category,
        is_public: collectionToEdit.is_public,
        tags: collectionToEdit.tags || [],
      });
    } else {
      reset({
        title: '',
        description: '',
        category: 'ielts',
        is_public: false,
        tags: [],
      });
    }
  }, [collectionToEdit, reset, isOpen]);

  const onSubmit = async (values: CollectionFormValues) => {
    try {
      if (isEditing && collectionToEdit) {
        const updated = await updateMutation.mutateAsync({
          id: collectionToEdit.id,
          dto: {
            title: values.title.trim(),
            description: values.description?.trim() || null,
            category: values.category as CollectionCategory,
            is_public: values.is_public,
            tags: values.tags || [],
          },
        });
        onSuccess?.(updated);
      } else {
        const created = await createMutation.mutateAsync({
          title: values.title.trim(),
          description: values.description?.trim() || null,
          category: values.category as CollectionCategory,
          is_public: values.is_public,
          tags: values.tags || [],
        });
        onSuccess?.(created);
      }
      onClose();
    } catch (err) {
      console.error('Save collection error:', err);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Chỉnh sửa bộ từ vựng' : 'Tạo bộ sưu tập mới'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Tên bộ sưu tập <span className="text-danger">*</span>
          </label>
          <Input
            placeholder="vd: IELTS 7.0 - Chủ đề Môi trường & Khí hậu"
            {...register('title')}
            className={errors.title ? 'border-danger' : ''}
            autoFocus
          />
          {errors.title && (
            <p className="text-xs text-danger mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Danh mục chủ đề <span className="text-danger">*</span>
          </label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {COLLECTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Mô tả tóm tắt
          </label>
          <Textarea
            rows={2}
            placeholder="Bộ từ vựng tổng hợp các collocations và từ nâng cao band 7.0+..."
            {...register('description')}
          />
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

        {/* Privacy Switch (Public / Private) */}
        <div className="p-3.5 rounded-xl bg-base/70 border border-border/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isPublic
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                {isPublic ? 'Công khai trên Thư viện cộng đồng' : 'Chỉ mình tôi (Riêng tư)'}
              </span>
              <p className="text-[11px] text-text-secondary">
                {isPublic
                  ? 'Những người học khác có thể tìm thấy và clone bộ từ này'
                  : 'Chỉ hiển thị trong kho cá nhân của bạn'}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setValue('is_public', !isPublic)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isPublic ? 'bg-brand' : 'bg-surface-hover'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="gap-1.5 bg-brand hover:bg-brand-hover text-white"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEditing ? 'Lưu thay đổi' : 'Tạo bộ sưu tập'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
