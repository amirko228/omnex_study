'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Loader2, 
  Zap, 
  BookOpen, 
  Clock,
  GraduationCap,
  Languages,
  Wand2
} from 'lucide-react';
import { aiService, type CourseGenerationRequest, type DifficultyLevel, type LessonFormat } from '@/lib/ai/ai-service';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

type AICourseGeneratorProps = {
  dict: Dictionary;
  locale: Locale;
  onCourseGenerated: (courseId: string) => void;
  onCancel: () => void;
};

export function AICourseGenerator({ dict, locale, onCourseGenerated, onCancel }: AICourseGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [formData, setFormData] = useState<CourseGenerationRequest>({
    topic: '',
    level: 'intermediate',
    duration: 10,
    language: locale,
    format: ['text', 'quiz', 'practice'],
    userBackground: '',
    learningGoals: []
  });

  const handleGenerate = async () => {
    if (!formData.topic.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Generate course using AI
      const course = await aiService.generateCourse(formData);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Wait a bit to show 100% completion
      setTimeout(() => {
        onCourseGenerated(course.id);
      }, 500);

    } catch (error) {
      console.error('Course generation error:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleLevelChange = (level: DifficultyLevel) => {
    setFormData(prev => ({ ...prev, level }));
  };

  const handleFormatToggle = (format: LessonFormat) => {
    setFormData(prev => {
      const formats = prev.format || [];
      const hasFormat = formats.includes(format);
      
      return {
        ...prev,
        format: hasFormat 
          ? formats.filter(f => f !== format)
          : [...formats, format]
      };
    });
  };

  const levelLabels: Record<DifficultyLevel, Record<Locale, string>> = {
    beginner: {
      ru: 'Начинающий',
      en: 'Beginner',
      de: 'Anfänger',
      es: 'Principiante',
      fr: 'Débutant'
    },
    intermediate: {
      ru: 'Средний',
      en: 'Intermediate',
      de: 'Fortgeschritten',
      es: 'Intermedio',
      fr: 'Intermédiaire'
    },
    advanced: {
      ru: 'Продвинутый',
      en: 'Advanced',
      de: 'Experte',
      es: 'Avanzado',
      fr: 'Avancé'
    }
  };

  const formatLabels: Record<LessonFormat, Record<Locale, string>> = {
    text: {
      ru: 'Текст',
      en: 'Text',
      de: 'Text',
      es: 'Texto',
      fr: 'Texte'
    },
    quiz: {
      ru: 'Тесты',
      en: 'Quizzes',
      de: 'Tests',
      es: 'Cuestionarios',
      fr: 'Quiz'
    },
    chat: {
      ru: 'Чат с ИИ',
      en: 'AI Chat',
      de: 'KI-Chat',
      es: 'Chat IA',
      fr: 'Chat IA'
    },
    practice: {
      ru: 'Практика',
      en: 'Practice',
      de: 'Praxis',
      es: 'Práctica',
      fr: 'Pratique'
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                {dict.courses?.generate?.title || 'AI Course Generator'}
              </CardTitle>
              <CardDescription className="text-base">
                {dict.courses?.generate?.description || 'Tell the AI what you want to learn and it will create a personalized course for you'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {locale === 'ru' ? 'ИИ создаёт ваш курс...' : 
                     locale === 'de' ? 'KI erstellt Ihren Kurs...' :
                     locale === 'es' ? 'La IA está creando tu curso...' :
                     locale === 'fr' ? 'L\'IA crée votre cours...' :
                     'AI is generating your course...'}
                  </h3>
                  <p className="text-muted-foreground">
                    {locale === 'ru' ? 'Это может занять несколько секунд' : 
                     locale === 'de' ? 'Dies kann einige Sekunden dauern' :
                     locale === 'es' ? 'Esto puede tardar unos segundos' :
                     locale === 'fr' ? 'Cela peut prendre quelques secondes' :
                     'This may take a few seconds'}
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {locale === 'ru' ? 'Прогресс' : 
                       locale === 'de' ? 'Fortschritt' :
                       locale === 'es' ? 'Progreso' :
                       locale === 'fr' ? 'Progrès' :
                       'Progress'}
                    </span>
                    <span>{generationProgress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-500" />
                    <span className="text-muted-foreground">
                      {locale === 'ru' ? 'Анализ темы' : 
                       locale === 'de' ? 'Themenanalyse' :
                       locale === 'es' ? 'Análisis del tema' :
                       locale === 'fr' ? 'Analyse du sujet' :
                       'Analyzing topic'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-blue-500" />
                    <span className="text-muted-foreground">
                      {locale === 'ru' ? 'Создание модулей' : 
                       locale === 'de' ? 'Module erstellen' :
                       locale === 'es' ? 'Creando módulos' :
                       locale === 'fr' ? 'Création de modules' :
                       'Creating modules'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span className="text-muted-foreground">
                      {locale === 'ru' ? 'Генерация уроков' : 
                       locale === 'de' ? 'Lektionen generieren' :
                       locale === 'es' ? 'Generando lecciones' :
                       locale === 'fr' ? 'Génération de leçons' :
                       'Generating lessons'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Topic Input */}
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-base font-semibold">
                    {dict.courses?.generate?.topic || 'What do you want to learn?'}
                  </Label>
                  <Input
                    id="topic"
                    placeholder={
                      locale === 'ru' ? 'Например: React, Machine Learning, Digital Marketing...' :
                      locale === 'de' ? 'Z.B.: React, Machine Learning, Digital Marketing...' :
                      locale === 'es' ? 'Por ejemplo: React, Machine Learning, Marketing Digital...' :
                      locale === 'fr' ? 'Par exemple: React, Machine Learning, Marketing Digital...' :
                      'e.g. React, Machine Learning, Digital Marketing...'
                    }
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    className="text-lg h-12"
                  />
                </div>

                {/* Difficulty Level */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    {dict.courses?.generate?.level || 'Difficulty Level'}
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((level) => (
                      <Button
                        key={level}
                        variant={formData.level === level ? 'default' : 'outline'}
                        onClick={() => handleLevelChange(level)}
                        className="h-auto py-4 flex flex-col gap-2"
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span>{levelLabels[level][locale]}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {dict.courses?.generate?.duration || 'Estimated Duration'}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 10 }))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">
                      {locale === 'ru' ? 'часов' :
                       locale === 'de' ? 'Stunden' :
                       locale === 'es' ? 'horas' :
                       locale === 'fr' ? 'heures' :
                       'hours'}
                    </span>
                  </div>
                </div>

                {/* Lesson Formats */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    {locale === 'ru' ? 'Форматы уроков' :
                     locale === 'de' ? 'Lektionsformate' :
                     locale === 'es' ? 'Formatos de lección' :
                     locale === 'fr' ? 'Formats de leçon' :
                     'Lesson Formats'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(['text', 'quiz', 'chat', 'practice'] as LessonFormat[]).map((format) => (
                      <Badge
                        key={format}
                        variant={formData.format?.includes(format) ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2 text-sm"
                        onClick={() => handleFormatToggle(format)}
                      >
                        {formatLabels[format][locale]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {locale === 'ru' ? 'Язык курса' :
                     locale === 'de' ? 'Kurssprache' :
                     locale === 'es' ? 'Idioma del curso' :
                     locale === 'fr' ? 'Langue du cours' :
                     'Course Language'}
                  </Label>
                  <div className="flex gap-2">
                    {(['ru', 'en', 'de', 'es', 'fr'] as Locale[]).map((lang) => (
                      <Button
                        key={lang}
                        variant={formData.language === lang ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, language: lang }))}
                      >
                        {lang.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Optional: User Background */}
                <div className="space-y-2">
                  <Label htmlFor="background" className="text-base font-semibold">
                    {locale === 'ru' ? 'Ваш опыт (необязательно)' :
                     locale === 'de' ? 'Ihr Hintergrund (optional)' :
                     locale === 'es' ? 'Tu experiencia (opcional)' :
                     locale === 'fr' ? 'Votre expérience (facultatif)' :
                     'Your Background (Optional)'}
                  </Label>
                  <Textarea
                    id="background"
                    placeholder={
                      locale === 'ru' ? 'Расскажите о своём опыте, чтобы ИИ лучше адаптировал курс...' :
                      locale === 'de' ? 'Erzählen Sie von Ihrer Erfahrung, damit die KI den Kurs besser anpassen kann...' :
                      locale === 'es' ? 'Cuéntanos sobre tu experiencia para que la IA adapte mejor el curso...' :
                      locale === 'fr' ? 'Parlez de votre expérience pour que l\'IA adapte mieux le cours...' :
                      'Tell us about your experience so AI can better adapt the course...'
                    }
                    value={formData.userBackground}
                    onChange={(e) => setFormData(prev => ({ ...prev, userBackground: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    {dict.common?.cancel || 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!formData.topic.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {dict.courses?.generate?.submit || 'Generate Course'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
