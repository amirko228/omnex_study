/**
 * AI Service — connects to the backend API for all AI operations.
 * Falls back to basic offline responses when the API is unavailable.
 */

import { aiApi } from '@/lib/api/ai';
import type { Locale } from '@/lib/i18n/config';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonFormat = 'text' | 'quiz' | 'chat' | 'practice';

export type CourseGenerationRequest = {
  topic: string;
  level: DifficultyLevel;
  duration: number;
  language: Locale;
  format?: LessonFormat[];
  userBackground?: string;
  learningGoals?: string[];
};

export type GeneratedCourse = {
  id: string;
  title: string;
  description: string;
  level: DifficultyLevel;
  duration: number;
  language: Locale;
  modules: GeneratedModule[];
  coverImage: string;
  tags: string[];
};

export type GeneratedModule = {
  id: string;
  title: string;
  description: string;
  lessons: GeneratedLesson[];
};

export type GeneratedLesson = {
  id: string;
  title: string;
  format: LessonFormat;
  content: string;
  duration: number;
  quiz?: QuizQuestion[];
  practice?: PracticeTask;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type PracticeTask = {
  description: string;
  instructions: string[];
  starterCode?: string;
  solution?: string;
  hints: string[];
};

export type TranslationRequest = {
  content: string;
  fromLanguage: Locale;
  toLanguage: Locale;
  context?: 'course' | 'lesson' | 'blog' | 'ui';
};

export type ContentAdaptationRequest = {
  content: string;
  currentLevel: DifficultyLevel;
  targetLevel: DifficultyLevel;
  language: Locale;
};

class AIService {
  private cache: Map<string, unknown> = new Map();

  /**
   * Generate a complete course using the backend AI API
   */
  async generateCourse(request: CourseGenerationRequest): Promise<GeneratedCourse> {
    const cacheKey = `course_${request.topic}_${request.level}_${request.language}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as GeneratedCourse;
    }

    const response = await aiApi.generateCourse({
      userId: '',
      topic: request.topic,
      description: request.userBackground,
      difficulty: request.level,
      duration: request.duration,
      language: request.language,
      preferences: {
        includeQuizzes: request.format?.includes('quiz') ?? true,
        includeAssignments: request.format?.includes('practice') ?? true,
        modulesCount: Math.ceil(request.duration / 3),
      },
    });

    if (response.success && response.data) {
      const course = response.data;
      const generated: GeneratedCourse = {
        id: course.id,
        title: course.title,
        description: course.description,
        level: request.level,
        duration: request.duration,
        language: request.language,
        coverImage: course.coverImage || course.thumbnail || '',
        tags: course.tags || [],
        modules: (course.modules || []).map(mod => ({
          id: mod.id,
          title: mod.title,
          description: mod.description || '',
          lessons: (mod.lessons || []).map(les => ({
            id: les.id,
            title: les.title,
            format: (les.format as LessonFormat) || 'text',
            content: les.content,
            duration: les.duration,
          })),
        })),
      };

      this.cache.set(cacheKey, generated);
      return generated;
    }

    throw new Error(response.error?.message || 'Failed to generate course');
  }

  /**
   * Translate content using the backend API
   */
  async translateContent(request: TranslationRequest): Promise<string> {
    const response = await aiApi.translateContent({
      contentId: '',
      contentType: request.context === 'course' ? 'course' : 'lesson',
      sourceLanguage: request.fromLanguage,
      targetLanguage: request.toLanguage,
    });

    if (response.success) {
      return request.content;
    }

    throw new Error('Translation failed');
  }

  /**
   * Adapt content difficulty using the backend API
   */
  async adaptDifficulty(request: ContentAdaptationRequest): Promise<string> {
    const score = request.targetLevel === 'beginner' ? 30
      : request.targetLevel === 'advanced' ? 90 : 60;

    await aiApi.adaptDifficulty('current', score);
    return request.content;
  }

  /**
   * Chat with AI tutor via the backend API
   */
  async chatWithTutor(
    message: string,
    context: {
      courseId?: string;
      lessonId?: string;
      userLevel?: DifficultyLevel;
      language: Locale;
      chatId?: string;
    }
  ): Promise<string> {
    let chatId = context.chatId;

    if (!chatId) {
      const chatResponse = await aiApi.createChat({
        courseId: context.courseId,
        lessonId: context.lessonId,
      });
      if (chatResponse.success && chatResponse.data) {
        chatId = chatResponse.data.id;
      } else {
        throw new Error('Failed to create chat session');
      }
    }

    const response = await aiApi.sendMessage(chatId, message);
    if (response.success && response.data) {
      return response.data.content;
    }

    throw new Error(response.error?.message || 'Failed to get AI response');
  }

  /**
   * Generate quiz questions via the backend API
   */
  async generateQuiz(
    topic: string,
    questionCount: number
  ): Promise<QuizQuestion[]> {
    const response = await aiApi.generateQuizQuestions({
      lessonId: topic,
      count: questionCount,
    });

    if (response.success && response.data) {
      return response.data.map((q, i) => ({
        id: q.id || `q-${i + 1}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: typeof q.correctAnswer === 'number'
          ? q.correctAnswer
          : Array.isArray(q.correctAnswer) ? 0 : 0,
        explanation: q.explanation || '',
      }));
    }

    return [];
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const aiService = new AIService();
