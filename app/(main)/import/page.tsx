'use client';

import React, { useState } from 'react';
import { ImportHeader } from '@/components/features/import/import-header';
import { ImportInputForm } from '@/components/features/import/import-input-form';
import { InteractiveReader } from '@/components/features/import/interactive-reader';
import { SavedArticlesList } from '@/components/features/import/saved-articles-list';
import { useInteractiveReader } from '@/hooks/features/import/use-interactive-reader';
import { useImportedTextsQuery } from '@/hooks/features/import/use-imported-texts-query';
import type { ImportedText } from '@/types/imported-text.types';

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'reader' | 'saved'>('reader');
  const [readerViewMode, setReaderViewMode] = useState<'input' | 'reading'>('input');

  const { data: savedArticles = [] } = useImportedTextsQuery();

  const {
    text,
    setText,
    title,
    setTitle,
    paragraphs,
    readingStats,
    selectedToken,
    activeContextSentence,
    handleSelectWord,
    handleClosePopover,
    isKnownWord,
    getKnownCardInfo,
    textSelection,
    handleTextSelection,
  } = useInteractiveReader();

  // Bắt đầu đọc bài viết tương tác
  const handleStartReading = () => {
    if (text.trim().length > 0) {
      setReaderViewMode('reading');
    }
  };

  // Quay lại chỉnh sửa văn bản
  const handleBackToInput = () => {
    setReaderViewMode('input');
  };

  // Mở bài đọc từ danh sách đã lưu
  const handleSelectSavedArticle = (article: ImportedText) => {
    setTitle(article.title);
    setText(article.raw_text);
    setActiveTab('reader');
    setReaderViewMode('reading');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-6">
      <ImportHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={savedArticles.length}
      />

      {activeTab === 'reader' && (
        <>
          {readerViewMode === 'input' ? (
            <ImportInputForm
              title={title}
              onTitleChange={setTitle}
              text={text}
              onTextChange={setText}
              onStartReading={handleStartReading}
            />
          ) : (
            <InteractiveReader
              title={title}
              paragraphs={paragraphs}
              readingStats={readingStats}
              selectedToken={selectedToken}
              activeContextSentence={activeContextSentence}
              onSelectWord={handleSelectWord}
              onClosePopover={handleClosePopover}
              isKnownWord={isKnownWord}
              getKnownCardInfo={getKnownCardInfo}
              onBackToInput={handleBackToInput}
              rawText={text}
              textSelection={textSelection}
              onTextSelection={handleTextSelection}
            />
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <SavedArticlesList onSelectArticle={handleSelectSavedArticle} />
      )}
    </div>
  );
}
