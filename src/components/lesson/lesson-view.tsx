'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, ListChecks, MessageSquare, ClipboardCheck, Loader2, Sparkles } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Lesson } from '@/lib/api/mock-data';
import type { CourseFormat } from '@/types';
import { adaptLessonContent, type AdaptedContent } from '@/lib/ai/content-adapter';
import { toast } from 'sonner';

type LessonViewProps = {
  lesson: Lesson;
  dict: Dictionary;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  currentFormat?: CourseFormat;
  onFormatChange?: (format: CourseFormat) => void;
};

export function LessonView({
  lesson,
  dict,
  onPrevious,
  onNext,
  onComplete,
  hasPrevious = false,
  hasNext = true,
  currentFormat = 'text',
  onFormatChange,
}: LessonViewProps) {
  const [isCompleted, setIsCompleted] = useState(lesson.completed || false);
  const [adaptedContent, setAdaptedContent] = useState<AdaptedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete?.();
  };

  const formatConfig = {
    text: {
      icon: FileText,
      label: dict.formats.text,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    quiz: {
      icon: ListChecks,
      label: dict.formats.quiz,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    chat: {
      icon: MessageSquare,
      label: dict.formats.chat,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    assignment: {
      icon: ClipboardCheck,
      label: dict.formats.assignment,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  };

  useEffect(() => {
    if (currentFormat && lesson) {
      setIsLoading(true);
      adaptLessonContent(lesson, currentFormat)
        .then((adapted) => {
          setAdaptedContent(adapted);
          setIsLoading(false);
        })
        .catch((error) => {
          toast.error(dict.toasts.content_adaptation_error);
          setIsLoading(false);
        });
    }
  }, [currentFormat, lesson, dict]);

  return (
    <div className="space-y-4 md:space-y-6 pb-32 md:pb-6">
      {/* Format Switcher */}
      {onFormatChange && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs md:text-sm text-muted-foreground">
                  ИИ адаптирует контент под выбранный формат
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {(Object.keys(formatConfig) as CourseFormat[]).map((format) => {
                  const config = formatConfig[format];
                  const Icon = config.icon;
                  const isActive = currentFormat === format;

                  return (
                    <Button
                      key={format}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={`gap-1.5 text-xs md:text-sm h-9 md:h-10 ${isActive ? '' : 'hover:border-primary'}`}
                      onClick={() => onFormatChange(format)}
                    >
                      <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                      <span className="truncate">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="capitalize text-xs">
              {lesson.type}
            </Badge>
            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span>{lesson.duration} min</span>
            </div>
            {isCompleted && (
              <Badge variant="default" className="gap-1 text-xs">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{dict.lesson.completed}</span>
                <span className="sm:hidden">✓</span>
              </Badge>
            )}
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight break-words">{lesson.title}</h1>
        </div>
      </div>

      {/* Lesson Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 md:p-6 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 md:py-20">
              <div className="relative">
                <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin" />
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 md:mt-6 text-base md:text-lg font-medium text-center">ИИ адаптирует контент...</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2 text-center px-4">
                Подстройка материала под формат &quot;{formatConfig[currentFormat].label}&quot;
              </p>
            </div>
          ) : adaptedContent ? (
            <div className="space-y-4 md:space-y-6 overflow-hidden">
              {/* AI Generated Badge */}
              {adaptedContent.metadata?.aiGenerated && (
                <Badge variant="secondary" className="gap-1.5 text-xs">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  Контент адаптирован ИИ
                </Badge>
              )}

              {/* Format-specific content rendering */}
              {currentFormat === 'text' && (
                <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
                  <div dangerouslySetInnerHTML={{ __html: adaptedContent.content as string }} />
                </div>
              )}

              {currentFormat === 'quiz' && (
                <div className="space-y-4 md:space-y-6 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-xl md:text-2xl font-bold">Интерактивный тест</h3>
                    <Badge variant="outline" className="text-xs w-fit">
                      {JSON.parse(adaptedContent.content as string).length} вопросов
                    </Badge>
                  </div>
                  {JSON.parse(adaptedContent.content as string).map((question: any, idx: number) => (
                    <Card key={question.id} className="border-2 overflow-hidden">
                      <CardHeader className="pb-3 md:pb-4 px-3 md:px-6 pt-3 md:pt-6">
                        <CardTitle className="text-base md:text-lg leading-relaxed break-words whitespace-normal">
                          Вопрос {idx + 1}: {question.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 px-3 md:px-6 pb-3 md:pb-6 overflow-hidden">
                        <div className="space-y-2">
                          {question.options.map((option: string, optIdx: number) => (
                            <Button
                              key={optIdx}
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-3 px-3 md:px-4 text-sm md:text-base whitespace-normal overflow-hidden"
                              onClick={() => {
                                if (optIdx === question.correctAnswer) {
                                  toast.success(`✅ Правильно! ${question.explanation}`);
                                } else {
                                  toast.error(`❌ Неверно. ${question.explanation}`);
                                }
                              }}
                            >
                              <span className="font-semibold mr-2 shrink-0">{String.fromCharCode(65 + optIdx)}.</span>
                              <span className="break-words text-left flex-1 overflow-hidden">{option}</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentFormat === 'chat' && (
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-purple-500/20 bg-purple-500/5 p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-2 text-sm md:text-base">AI Наставник готов помочь</h3>
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed break-words">
                          {JSON.parse(adaptedContent.content as string).initialMessages[0].content}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 md:p-4 bg-muted/30">
                    <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 leading-relaxed">
                      💡 {JSON.parse(adaptedContent.content as string).initialMessages[1].content}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Задайте вопрос..."
                        className="flex-1 px-3 md:px-4 py-2 rounded-lg border bg-background text-sm"
                      />
                      <Button className="w-full sm:w-auto text-sm">
                        <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                        Спросить
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentFormat === 'assignment' && (
                <div className="space-y-4 md:space-y-6">
                  {(() => {
                    const assignment = JSON.parse(adaptedContent.content as string);
                    return (
                      <>
                        <div className="rounded-xl border-2 border-orange-500/20 bg-orange-500/5 p-4 md:p-6">
                          <h3 className="text-lg md:text-xl font-bold mb-2 break-words leading-tight">{assignment.title}</h3>
                          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{assignment.description}</p>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                          {assignment.tasks.map((task: any, idx: number) => (
                            <Card key={task.id} className="border-2">
                              <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base md:text-lg mb-1 md:mb-2 break-words leading-tight">{task.title}</CardTitle>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                                  </div>
                                  <Badge variant="outline" className="capitalize text-xs w-fit shrink-0">
                                    {task.difficulty}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                                  <span>~{task.estimatedTime} мин</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Card className="border-2 border-dashed">
                          <CardHeader className="pb-3 md:pb-4">
                            <CardTitle className="text-base md:text-lg">Отправить решение</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 md:space-y-4 pt-0">
                            <div className="rounded-lg border bg-muted/50 p-3 md:p-4 font-mono text-xs md:text-sm overflow-x-auto">
                              <pre className="whitespace-pre-wrap break-all">{assignment.submission.template}</pre>
                            </div>
                            <Button className="w-full h-10 md:h-11 text-sm md:text-base">
                              <ClipboardCheck className="mr-2 h-4 w-4 shrink-0" />
                              Отправить на проверку ИИ
                            </Button>
                            <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
                              ✨ ИИ проверит ваше решение по {assignment.aiChecking.criteria.length} критериям
                            </p>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Metadata */}
              {adaptedContent.metadata && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                  {adaptedContent.metadata.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Примерное время: {adaptedContent.metadata.estimatedTime} мин</span>
                    </div>
                  )}
                  {adaptedContent.metadata.difficulty && (
                    <Badge variant="secondary" className="capitalize">
                      {adaptedContent.metadata.difficulty}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Fallback to original content
            <div>
              {lesson.type === 'video' && (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Video Player Placeholder</p>
                </div>
              )}
              {lesson.type === 'text' && (
                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    {lesson.content ||
                      `This is the content for "${lesson.title}". In a production environment, this would contain the actual lesson content retrieved from the backend API.`}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {dict.lesson.previous}
        </Button>

        <div className="flex gap-2">
          {!isCompleted && (
            <Button variant="outline" onClick={handleComplete}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {dict.lesson.complete}
            </Button>
          )}
          <Button onClick={onNext} disabled={!hasNext}>
            {dict.lesson.next}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}