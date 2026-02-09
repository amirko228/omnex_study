/**
 * AI Service for dynamic content generation
 * This service interfaces with AI to:
 * - Generate courses based on user input
 * - Translate content to any language
 * - Adapt difficulty levels
 * - Create lessons in multiple formats
 */

import type { Locale } from '@/lib/i18n/config';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonFormat = 'text' | 'quiz' | 'chat' | 'practice';

export type CourseGenerationRequest = {
  topic: string;
  level: DifficultyLevel;
  duration: number; // hours
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

/**
 * AI Service Class
 * In production, this would connect to OpenAI, Anthropic, or custom AI backend
 * For now, it uses mock data with realistic AI-like responses
 */
class AIService {
  private apiKey: string | null = null;
  private baseUrl: string = '/api/ai'; // Backend API endpoint
  private cache: Map<string, any> = new Map();

  constructor() {
    // In production, get API key from environment or user settings
    this.apiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('ai_api_key') 
      : null;
  }

  /**
   * Generate a complete course using AI
   */
  async generateCourse(request: CourseGenerationRequest): Promise<GeneratedCourse> {
    const cacheKey = `course_${request.topic}_${request.level}_${request.language}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Simulate AI processing delay
    await this.delay(2000);

    // AI Prompt (would be sent to real AI in production)
    const prompt = this.buildCourseGenerationPrompt(request);
    
    // Mock AI-generated course (in production, call real AI API)
    const course = this.mockGenerateCourse(request);
    
    // Cache the result
    this.cache.set(cacheKey, course);
    
    return course;
  }

  /**
   * Translate content using AI
   */
  async translateContent(request: TranslationRequest): Promise<string> {
    const cacheKey = `translate_${request.content.substring(0, 50)}_${request.toLanguage}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this.delay(500);

    // AI Prompt for translation
    const prompt = `Translate the following ${request.context || 'text'} from ${request.fromLanguage} to ${request.toLanguage}. Maintain the tone and technical accuracy:\n\n${request.content}`;

    // Mock translation (in production, call real AI)
    const translated = this.mockTranslate(request);
    
    this.cache.set(cacheKey, translated);
    return translated;
  }

  /**
   * Adapt content difficulty using AI
   */
  async adaptDifficulty(request: ContentAdaptationRequest): Promise<string> {
    const cacheKey = `adapt_${request.content.substring(0, 50)}_${request.targetLevel}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    await this.delay(1000);

    // AI Prompt for difficulty adaptation
    const prompt = `Adapt the following content from ${request.currentLevel} to ${request.targetLevel} level in ${request.language}. Adjust complexity, examples, and explanations accordingly:\n\n${request.content}`;

    // Mock adaptation
    const adapted = this.mockAdaptDifficulty(request);
    
    this.cache.set(cacheKey, adapted);
    return adapted;
  }

  /**
   * Generate lesson in specific format
   */
  async generateLesson(
    topic: string, 
    format: LessonFormat, 
    level: DifficultyLevel,
    language: Locale
  ): Promise<GeneratedLesson> {
    await this.delay(1500);

    const prompt = `Generate a ${level} level ${format} lesson about "${topic}" in ${language}.`;

    return this.mockGenerateLesson(topic, format, level, language);
  }

  /**
   * Chat with AI tutor
   */
  async chatWithTutor(
    message: string,
    context: {
      courseId?: string;
      lessonId?: string;
      userLevel?: DifficultyLevel;
      language: Locale;
    }
  ): Promise<string> {
    await this.delay(800);

    const prompt = `You are an AI tutor helping a ${context.userLevel || 'intermediate'} level student. Respond to their question in ${context.language}:\n\nStudent: ${message}\n\nTutor:`;

    // Mock AI tutor response
    return this.mockTutorResponse(message, context);
  }

  /**
   * Generate quiz questions
   */
  async generateQuiz(
    topic: string,
    questionCount: number,
    level: DifficultyLevel,
    language: Locale
  ): Promise<QuizQuestion[]> {
    await this.delay(1200);

    return this.mockGenerateQuiz(topic, questionCount, level, language);
  }

  // ==================== PRIVATE HELPERS ====================

  private buildCourseGenerationPrompt(request: CourseGenerationRequest): string {
    return `
You are an expert course creator. Generate a comprehensive ${request.level} level course about "${request.topic}" in ${request.language}.

Requirements:
- Duration: ${request.duration} hours
- Target audience: ${request.level} level learners
- Language: ${request.language}
- Formats: ${request.format?.join(', ') || 'text, quiz, practice'}
${request.userBackground ? `- User background: ${request.userBackground}` : ''}
${request.learningGoals ? `- Learning goals: ${request.learningGoals.join(', ')}` : ''}

Create a structured course with:
1. Clear learning objectives
2. Multiple modules with progressive difficulty
3. Mix of theoretical and practical lessons
4. Quizzes for assessment
5. Practice exercises
6. Real-world examples

Output format: JSON with course metadata, modules, and lessons.
    `.trim();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== MOCK IMPLEMENTATIONS ====================
  // In production, replace these with real AI API calls

  private mockGenerateCourse(request: CourseGenerationRequest): GeneratedCourse {
    const moduleCount = Math.ceil(request.duration / 3);
    const lessonsPerModule = Math.ceil(request.duration / moduleCount);

    return {
      id: `ai-course-${Date.now()}`,
      title: this.getLocalizedTitle(request.topic, request.language),
      description: this.getLocalizedDescription(request.topic, request.level, request.language),
      level: request.level,
      duration: request.duration,
      language: request.language,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop',
      tags: this.generateTags(request.topic, request.language),
      modules: Array.from({ length: moduleCount }, (_, i) => ({
        id: `module-${i + 1}`,
        title: `${this.getModuleWord(request.language)} ${i + 1}: ${this.getModuleTitle(request.topic, i, request.language)}`,
        description: this.getModuleDescription(i, request.language),
        lessons: Array.from({ length: lessonsPerModule }, (_, j) => 
          this.mockGenerateLesson(
            `${request.topic} - ${this.getLessonTopic(i, j, request.language)}`,
            this.selectLessonFormat(j, request.format),
            request.level,
            request.language
          )
        )
      }))
    };
  }

  private mockGenerateLesson(
    topic: string,
    format: LessonFormat,
    level: DifficultyLevel,
    language: Locale
  ): GeneratedLesson {
    const lesson: GeneratedLesson = {
      id: `lesson-${Date.now()}-${Math.random()}`,
      title: topic,
      format,
      content: this.generateLessonContent(topic, format, level, language),
      duration: format === 'text' ? 15 : format === 'quiz' ? 10 : 20,
    };

    if (format === 'quiz') {
      lesson.quiz = this.mockGenerateQuiz(topic, 5, level, language);
    }

    if (format === 'practice') {
      lesson.practice = {
        description: this.getPracticeDescription(topic, language),
        instructions: this.getPracticeInstructions(language),
        hints: this.getPracticeHints(language)
      };
    }

    return lesson;
  }

  private mockGenerateQuiz(
    topic: string,
    count: number,
    level: DifficultyLevel,
    language: Locale
  ): QuizQuestion[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `q-${i + 1}`,
      question: this.getQuizQuestion(topic, i, level, language),
      options: this.getQuizOptions(i, language),
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: this.getQuizExplanation(i, language)
    }));
  }

  private mockTranslate(request: TranslationRequest): string {
    // In production, this would call actual translation AI
    // For now, return original content with language marker
    return `[${request.toLanguage.toUpperCase()}] ${request.content}`;
  }

  private mockAdaptDifficulty(request: ContentAdaptationRequest): string {
    const prefix = request.targetLevel === 'beginner' ? '[Simplified] ' :
                   request.targetLevel === 'advanced' ? '[Advanced] ' : '';
    return `${prefix}${request.content}`;
  }

  private mockTutorResponse(message: string, context: any): string {
    const responses: Record<Locale, string[]> = {
      ru: [
        'Отличный вопрос! Давайте разберем это подробнее...',
        'Я помогу вам разобраться. Вот что вам нужно знать...',
        'Это важная тема! Вот мое объяснение...'
      ],
      en: [
        'Great question! Let me explain this in detail...',
        'I\'ll help you understand this. Here\'s what you need to know...',
        'This is an important topic! Here\'s my explanation...'
      ],
      de: [
        'Gute Frage! Lassen Sie mich das im Detail erklären...',
        'Ich helfe Ihnen, das zu verstehen. Das müssen Sie wissen...',
        'Das ist ein wichtiges Thema! Hier ist meine Erklärung...'
      ],
      es: [
        '¡Buena pregunta! Déjame explicarte esto en detalle...',
        'Te ayudaré a entender esto. Esto es lo que necesitas saber...',
        '¡Este es un tema importante! Aquí está mi explicación...'
      ],
      fr: [
        'Bonne question ! Laissez-moi vous expliquer cela en détail...',
        'Je vais vous aider à comprendre cela. Voici ce que vous devez savoir...',
        'C\'est un sujet important ! Voici mon explication...'
      ]
    };

    const languageResponses = responses[context.language] || responses.en;
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
  }

  // ==================== LOCALIZATION HELPERS ====================

  private getLocalizedTitle(topic: string, language: Locale): string {
    const templates: Record<Locale, string> = {
      ru: `Полный курс по ${topic}`,
      en: `Complete ${topic} Course`,
      de: `Vollständiger ${topic} Kurs`,
      es: `Curso completo de ${topic}`,
      fr: `Cours complet de ${topic}`
    };
    return templates[language] || templates.en;
  }

  private getLocalizedDescription(topic: string, level: DifficultyLevel, language: Locale): string {
    const levelNames: Record<Locale, Record<DifficultyLevel, string>> = {
      ru: { beginner: 'начинающих', intermediate: 'продвинутых', advanced: 'экспертов' },
      en: { beginner: 'beginners', intermediate: 'intermediate learners', advanced: 'advanced learners' },
      de: { beginner: 'Anfänger', intermediate: 'Fortgeschrittene', advanced: 'Experten' },
      es: { beginner: 'principiantes', intermediate: 'intermedios', advanced: 'avanzados' },
      fr: { beginner: 'débutants', intermediate: 'intermédiaires', advanced: 'avancés' }
    };

    const templates: Record<Locale, string> = {
      ru: `Изучите ${topic} с нуля до профессионального уровня. Курс создан ИИ специально для ${levelNames[language][level]}.`,
      en: `Master ${topic} from scratch to professional level. AI-generated course for ${levelNames[language][level]}.`,
      de: `Meistern Sie ${topic} von Grund auf bis zum professionellen Niveau. KI-generierter Kurs für ${levelNames[language][level]}.`,
      es: `Domina ${topic} desde cero hasta nivel profesional. Curso generado por IA para ${levelNames[language][level]}.`,
      fr: `Maîtrisez ${topic} de zéro au niveau professionnel. Cours généré par IA pour ${levelNames[language][level]}.`
    };

    return templates[language] || templates.en;
  }

  private getModuleWord(language: Locale): string {
    const words: Record<Locale, string> = {
      ru: 'Модуль',
      en: 'Module',
      de: 'Modul',
      es: 'Módulo',
      fr: 'Module'
    };
    return words[language] || words.en;
  }

  private getModuleTitle(topic: string, index: number, language: Locale): string {
    const titles: Record<Locale, string[]> = {
      ru: ['Введение', 'Основы', 'Продвинутые концепции', 'Практическое применение', 'Мастер-класс'],
      en: ['Introduction', 'Fundamentals', 'Advanced Concepts', 'Practical Application', 'Masterclass'],
      de: ['Einführung', 'Grundlagen', 'Fortgeschrittene Konzepte', 'Praktische Anwendung', 'Meisterklasse'],
      es: ['Introducción', 'Fundamentos', 'Conceptos Avanzados', 'Aplicación Práctica', 'Clase Magistral'],
      fr: ['Introduction', 'Fondamentaux', 'Concepts Avancés', 'Application Pratique', 'Masterclass']
    };
    const languageTitles = titles[language] || titles.en;
    return languageTitles[index % languageTitles.length];
  }

  private getModuleDescription(index: number, language: Locale): string {
    const descriptions: Record<Locale, string[]> = {
      ru: [
        'Познакомьтесь с основными концепциями и терминологией',
        'Углубите свое понимание ключевых принципов',
        'Освойте сложные техники и паттерны',
        'Применяйте знания на практике с реальными проектами'
      ],
      en: [
        'Get familiar with core concepts and terminology',
        'Deepen your understanding of key principles',
        'Master complex techniques and patterns',
        'Apply knowledge in practice with real projects'
      ],
      de: [
        'Machen Sie sich mit Kernkonzepten und Terminologie vertraut',
        'Vertiefen Sie Ihr Verständnis der Schlüsselprinzipien',
        'Meistern Sie komplexe Techniken und Muster',
        'Wenden Sie Wissen in der Praxis mit echten Projekten an'
      ],
      es: [
        'Familiarízate con conceptos básicos y terminología',
        'Profundiza tu comprensión de principios clave',
        'Domina técnicas y patrones complejos',
        'Aplica conocimientos en la práctica con proyectos reales'
      ],
      fr: [
        'Familiarisez-vous avec les concepts de base et la terminologie',
        'Approfondissez votre compréhension des principes clés',
        'Maîtrisez les techniques et modèles complexes',
        'Appliquez les connaissances en pratique avec de vrais projets'
      ]
    };
    const languageDescriptions = descriptions[language] || descriptions.en;
    return languageDescriptions[index % languageDescriptions.length];
  }

  private getLessonTopic(moduleIndex: number, lessonIndex: number, language: Locale): string {
    const topics: Record<Locale, string[]> = {
      ru: ['Основы', 'Примеры', 'Практика', 'Тестирование', 'Проект'],
      en: ['Basics', 'Examples', 'Practice', 'Testing', 'Project'],
      de: ['Grundlagen', 'Beispiele', 'Praxis', 'Testen', 'Projekt'],
      es: ['Básicos', 'Ejemplos', 'Práctica', 'Pruebas', 'Proyecto'],
      fr: ['Bases', 'Exemples', 'Pratique', 'Tests', 'Projet']
    };
    const languageTopics = topics[language] || topics.en;
    return languageTopics[lessonIndex % languageTopics.length];
  }

  private selectLessonFormat(index: number, preferredFormats?: LessonFormat[]): LessonFormat {
    if (preferredFormats && preferredFormats.length > 0) {
      return preferredFormats[index % preferredFormats.length];
    }
    const formats: LessonFormat[] = ['text', 'quiz', 'practice', 'chat'];
    return formats[index % formats.length];
  }

  private generateLessonContent(topic: string, format: LessonFormat, level: DifficultyLevel, language: Locale): string {
    const templates: Record<Locale, Record<LessonFormat, string>> = {
      ru: {
        text: `<h2>Введение</h2><p>В этом уроке мы изучим ${topic}. Вы узнаете ключевые концепции и научитесь применять их на практике.</p><h2>Основные концепции</h2><p>ИИ-генерированный контент адаптирован под ваш уровень (${level})...</p>`,
        quiz: `<h2>Проверьте свои знания</h2><p>Ответьте на вопросы по теме ${topic}</p>`,
        chat: `<h2>Чат с ИИ-наставником</h2><p>Задавайте вопросы по теме ${topic} - ИИ поможет вам разобраться</p>`,
        practice: `<h2>Практическое задание</h2><p>Примените полученные знания о ${topic} на практике</p>`
      },
      en: {
        text: `<h2>Introduction</h2><p>In this lesson, we'll explore ${topic}. You'll learn key concepts and how to apply them in practice.</p><h2>Core Concepts</h2><p>AI-generated content adapted to your level (${level})...</p>`,
        quiz: `<h2>Test Your Knowledge</h2><p>Answer questions about ${topic}</p>`,
        chat: `<h2>Chat with AI Tutor</h2><p>Ask questions about ${topic} - AI will help you understand</p>`,
        practice: `<h2>Practical Exercise</h2><p>Apply your knowledge of ${topic} in practice</p>`
      },
      de: {
        text: `<h2>Einführung</h2><p>In dieser Lektion werden wir ${topic} erkunden. Sie lernen Schlüsselkonzepte und wie man sie in der Praxis anwendet.</p><h2>Kernkonzepte</h2><p>KI-generierter Inhalt angepasst an Ihr Niveau (${level})...</p>`,
        quiz: `<h2>Testen Sie Ihr Wissen</h2><p>Beantworten Sie Fragen zu ${topic}</p>`,
        chat: `<h2>Chat mit KI-Tutor</h2><p>Stellen Sie Fragen zu ${topic} - KI wird Ihnen helfen zu verstehen</p>`,
        practice: `<h2>Praktische Übung</h2><p>Wenden Sie Ihr Wissen über ${topic} in der Praxis an</p>`
      },
      es: {
        text: `<h2>Introducción</h2><p>En esta lección, exploraremos ${topic}. Aprenderás conceptos clave y cómo aplicarlos en la práctica.</p><h2>Conceptos Básicos</h2><p>Contenido generado por IA adaptado a tu nivel (${level})...</p>`,
        quiz: `<h2>Pon a prueba tus conocimientos</h2><p>Responde preguntas sobre ${topic}</p>`,
        chat: `<h2>Chat con tutor de IA</h2><p>Haz preguntas sobre ${topic} - la IA te ayudará a entender</p>`,
        practice: `<h2>Ejercicio Práctico</h2><p>Aplica tus conocimientos sobre ${topic} en la práctica</p>`
      },
      fr: {
        text: `<h2>Introduction</h2><p>Dans cette leçon, nous explorerons ${topic}. Vous apprendrez les concepts clés et comment les appliquer en pratique.</p><h2>Concepts de Base</h2><p>Contenu généré par IA adapté à votre niveau (${level})...</p>`,
        quiz: `<h2>Testez vos connaissances</h2><p>Répondez aux questions sur ${topic}</p>`,
        chat: `<h2>Chat avec tuteur IA</h2><p>Posez des questions sur ${topic} - l'IA vous aidera à comprendre</p>`,
        practice: `<h2>Exercice Pratique</h2><p>Appliquez vos connaissances sur ${topic} en pratique</p>`
      }
    };

    return templates[language]?.[format] || templates.en[format];
  }

  private generateTags(topic: string, language: Locale): string[] {
    const commonTags: Record<Locale, string[]> = {
      ru: ['ИИ-генерированный', 'Интерактивный', 'Практика'],
      en: ['AI-Generated', 'Interactive', 'Hands-on'],
      de: ['KI-generiert', 'Interaktiv', 'Praktisch'],
      es: ['Generado por IA', 'Interactivo', 'Práctico'],
      fr: ['Généré par IA', 'Interactif', 'Pratique']
    };
    return [topic, ...(commonTags[language] || commonTags.en)];
  }

  private getPracticeDescription(topic: string, language: Locale): string {
    const templates: Record<Locale, string> = {
      ru: `Практическое задание по теме ${topic}`,
      en: `Practical exercise on ${topic}`,
      de: `Praktische Übung zu ${topic}`,
      es: `Ejercicio práctico sobre ${topic}`,
      fr: `Exercice pratique sur ${topic}`
    };
    return templates[language] || templates.en;
  }

  private getPracticeInstructions(language: Locale): string[] {
    const instructions: Record<Locale, string[]> = {
      ru: ['Изучите задание', 'Примените полученные знания', 'Проверьте решение'],
      en: ['Study the task', 'Apply your knowledge', 'Check the solution'],
      de: ['Studieren Sie die Aufgabe', 'Wenden Sie Ihr Wissen an', 'Überprüfen Sie die Lösung'],
      es: ['Estudia la tarea', 'Aplica tus conocimientos', 'Verifica la solución'],
      fr: ['Étudiez la tâche', 'Appliquez vos connaissances', 'Vérifiez la solution']
    };
    return instructions[language] || instructions.en;
  }

  private getPracticeHints(language: Locale): string[] {
    const hints: Record<Locale, string[]> = {
      ru: ['Подсказка 1: Начните с простого', 'Подсказка 2: Используйте документацию'],
      en: ['Hint 1: Start simple', 'Hint 2: Use documentation'],
      de: ['Hinweis 1: Beginnen Sie einfach', 'Hinweis 2: Verwenden Sie die Dokumentation'],
      es: ['Pista 1: Comienza simple', 'Pista 2: Usa la documentación'],
      fr: ['Indice 1: Commencez simplement', 'Indice 2: Utilisez la documentation']
    };
    return hints[language] || hints.en;
  }

  private getQuizQuestion(topic: string, index: number, level: DifficultyLevel, language: Locale): string {
    const templates: Record<Locale, string> = {
      ru: `Вопрос ${index + 1} о ${topic} (уровень: ${level})`,
      en: `Question ${index + 1} about ${topic} (level: ${level})`,
      de: `Frage ${index + 1} über ${topic} (Niveau: ${level})`,
      es: `Pregunta ${index + 1} sobre ${topic} (nivel: ${level})`,
      fr: `Question ${index + 1} sur ${topic} (niveau: ${level})`
    };
    return templates[language] || templates.en;
  }

  private getQuizOptions(index: number, language: Locale): string[] {
    const options: Record<Locale, string[][]> = {
      ru: [
        ['Вариант А', 'Вариант Б', 'Вариант В', 'Вариант Г'],
        ['Первый вариант', 'Второй вариант', 'Третий вариант', 'Четвертый вариант']
      ],
      en: [
        ['Option A', 'Option B', 'Option C', 'Option D'],
        ['First option', 'Second option', 'Third option', 'Fourth option']
      ],
      de: [
        ['Option A', 'Option B', 'Option C', 'Option D'],
        ['Erste Option', 'Zweite Option', 'Dritte Option', 'Vierte Option']
      ],
      es: [
        ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        ['Primera opción', 'Segunda opción', 'Tercera opción', 'Cuarta opción']
      ],
      fr: [
        ['Option A', 'Option B', 'Option C', 'Option D'],
        ['Première option', 'Deuxième option', 'Troisième option', 'Quatrième option']
      ]
    };
    const languageOptions = options[language] || options.en;
    return languageOptions[index % languageOptions.length];
  }

  private getQuizExplanation(index: number, language: Locale): string {
    const explanations: Record<Locale, string> = {
      ru: 'ИИ-генерированное объяснение правильного ответа...',
      en: 'AI-generated explanation of the correct answer...',
      de: 'KI-generierte Erklärung der richtigen Antwort...',
      es: 'Explicación generada por IA de la respuesta correcta...',
      fr: 'Explication générée par IA de la bonne réponse...'
    };
    return explanations[language] || explanations.en;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set API key (for production use)
   */
  setApiKey(key: string): void {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_api_key', key);
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
