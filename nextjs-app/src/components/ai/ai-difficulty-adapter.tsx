'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Zap, 
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { aiService, type DifficultyLevel } from '@/lib/ai/ai-service';
import type { Locale } from '@/lib/i18n/config';

type AIDifficultyAdapterProps = {
  content: string;
  currentLevel: DifficultyLevel;
  locale: Locale;
  onAdapted: (adaptedContent: string, newLevel: DifficultyLevel) => void;
};

export function AIDifficultyAdapter({ 
  content, 
  currentLevel, 
  locale,
  onAdapted 
}: AIDifficultyAdapterProps) {
  const [targetLevel, setTargetLevel] = useState<DifficultyLevel>(currentLevel);
  const [isAdapting, setIsAdapting] = useState(false);

  const levels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
  const levelIndex = levels.indexOf(currentLevel);
  const targetLevelIndex = levels.indexOf(targetLevel);

  const handleAdapt = async () => {
    if (targetLevel === currentLevel || isAdapting) return;

    setIsAdapting(true);

    try {
      const adaptedContent = await aiService.adaptDifficulty({
        content,
        currentLevel,
        targetLevel,
        language: locale
      });

      onAdapted(adaptedContent, targetLevel);
    } catch {
      // silently ignored
    } finally {
      setIsAdapting(false);
    }
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

  const getChangeIcon = () => {
    if (targetLevelIndex > levelIndex) return <TrendingUp className="w-4 h-4" />;
    if (targetLevelIndex < levelIndex) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeText = () => {
    if (targetLevelIndex > levelIndex) {
      return locale === 'ru' ? 'Усложнить' :
             locale === 'de' ? 'Schwieriger machen' :
             locale === 'es' ? 'Hacer más difícil' :
             locale === 'fr' ? 'Rendre plus difficile' :
             'Make harder';
    }
    if (targetLevelIndex < levelIndex) {
      return locale === 'ru' ? 'Упростить' :
             locale === 'de' ? 'Vereinfachen' :
             locale === 'es' ? 'Simplificar' :
             locale === 'fr' ? 'Simplifier' :
             'Simplify';
    }
    return locale === 'ru' ? 'Без изменений' :
           locale === 'de' ? 'Keine Änderung' :
           locale === 'es' ? 'Sin cambios' :
           locale === 'fr' ? 'Pas de changement' :
           'No change';
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">
                {locale === 'ru' ? 'Адаптация сложности' :
                 locale === 'de' ? 'Schwierigkeitsanpassung' :
                 locale === 'es' ? 'Adaptación de dificultad' :
                 locale === 'fr' ? 'Adaptation de difficulté' :
                 'Difficulty Adaptation'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {locale === 'ru' ? 'ИИ подстроит контент под ваш уровень' :
                 locale === 'de' ? 'KI passt Inhalte an Ihr Niveau an' :
                 locale === 'es' ? 'La IA adaptará el contenido a tu nivel' :
                 locale === 'fr' ? 'L\'IA adaptera le contenu à votre niveau' :
                 'AI will adapt content to your level'}
              </p>
            </div>
          </div>

          {/* Current Level */}
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              {locale === 'ru' ? 'Текущий уровень:' :
               locale === 'de' ? 'Aktuelles Niveau:' :
               locale === 'es' ? 'Nivel actual:' :
               locale === 'fr' ? 'Niveau actuel:' :
               'Current level:'}
            </span>
            <Badge variant="secondary" className="text-sm">
              {levelLabels[currentLevel][locale]}
            </Badge>
          </div>

          {/* Level Selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {locale === 'ru' ? 'Целевой уровень:' :
                 locale === 'de' ? 'Zielniveau:' :
                 locale === 'es' ? 'Nivel objetivo:' :
                 locale === 'fr' ? 'Niveau cible:' :
                 'Target level:'}
              </span>
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              >
                {levelLabels[targetLevel][locale]}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {levels.map((level) => (
                <Button
                  key={level}
                  variant={targetLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetLevel(level)}
                  disabled={isAdapting}
                  className={targetLevel === level ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                >
                  {levelLabels[level][locale]}
                </Button>
              ))}
            </div>
          </div>

          {/* Adapt Button */}
          <Button
            onClick={handleAdapt}
            disabled={targetLevel === currentLevel || isAdapting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            {isAdapting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {locale === 'ru' ? 'Адаптация...' :
                 locale === 'de' ? 'Anpassung...' :
                 locale === 'es' ? 'Adaptando...' :
                 locale === 'fr' ? 'Adaptation...' :
                 'Adapting...'}
              </>
            ) : (
              <>
                {getChangeIcon()}
                <span className="ml-2">{getChangeText()}</span>
              </>
            )}
          </Button>

          {/* Preview */}
          {targetLevel !== currentLevel && !isAdapting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {targetLevelIndex > levelIndex ? (
                    locale === 'ru' ? 'ИИ добавит более сложные концепции, технические термины и углубленные примеры.' :
                    locale === 'de' ? 'KI fügt komplexere Konzepte, technische Begriffe und vertiefte Beispiele hinzu.' :
                    locale === 'es' ? 'La IA agregará conceptos más complejos, términos técnicos y ejemplos profundos.' :
                    locale === 'fr' ? 'L\'IA ajoutera des concepts plus complexes, des termes techniques et des exemples approfondis.' :
                    'AI will add more complex concepts, technical terms, and in-depth examples.'
                  ) : (
                    locale === 'ru' ? 'ИИ упростит язык, добавит больше пояснений и базовых примеров.' :
                    locale === 'de' ? 'KI vereinfacht die Sprache, fügt mehr Erklärungen und grundlegende Beispiele hinzu.' :
                    locale === 'es' ? 'La IA simplificará el lenguaje, agregará más explicaciones y ejemplos básicos.' :
                    locale === 'fr' ? 'L\'IA simplifiera le langage, ajoutera plus d\'explications et d\'exemples de base.' :
                    'AI will simplify language, add more explanations and basic examples.'
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
