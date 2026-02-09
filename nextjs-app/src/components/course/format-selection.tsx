'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ListChecks, 
  MessageSquare, 
  ClipboardCheck,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { CourseFormat } from '@/types';

type FormatSelectionProps = {
  dict: Dictionary;
  courseTitle: string;
  onSelectFormat: (format: CourseFormat) => void;
  onBack: () => void;
};

export function FormatSelection({ dict, courseTitle, onSelectFormat, onBack }: FormatSelectionProps) {
  const [selectedFormat, setSelectedFormat] = useState<CourseFormat | null>(null);

  const formatConfig = {
    text: {
      icon: FileText,
      title: dict.formats.text_title,
      description: dict.formats.text_description,
      color: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-500',
      features: dict.formats.text_features
    },
    quiz: {
      icon: ListChecks,
      title: dict.formats.quiz_title,
      description: dict.formats.quiz_description,
      color: 'from-green-500/10 to-green-500/5',
      iconColor: 'text-green-500',
      features: dict.formats.quiz_features
    },
    chat: {
      icon: MessageSquare,
      title: dict.formats.chat_title,
      description: dict.formats.chat_description,
      color: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-500',
      features: dict.formats.chat_features
    },
    assignment: {
      icon: ClipboardCheck,
      title: dict.formats.assignment_title,
      description: dict.formats.assignment_description,
      color: 'from-orange-500/10 to-orange-500/5',
      iconColor: 'text-orange-500',
      features: dict.formats.assignment_features
    }
  };

  const handleSelectFormat = (format: CourseFormat) => {
    setSelectedFormat(format);
    setTimeout(() => {
      onSelectFormat(format);
    }, 300);
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 pb-32 md:pb-10">
      <Button variant="ghost" className="mb-6 md:mb-8 -ml-2" onClick={onBack}>
        <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
        {dict.course.back_to_courses}
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12 text-center px-2"
      >
        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
          <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            {dict.courses.generate.title}
          </h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {dict.courses.generate.description}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
        {(Object.keys(formatConfig) as CourseFormat[]).map((format, index) => {
          const config = formatConfig[format];
          const Icon = config.icon;
          const isSelected = selectedFormat === format;

          return (
            <motion.div
              key={format}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-xl ${
                  isSelected 
                    ? 'border-2 border-primary ring-4 ring-primary/20 md:scale-105' 
                    : 'border-2 border-transparent hover:border-primary/50'
                }`}
                onClick={() => handleSelectFormat(format)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <motion.div 
                      className={`h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Icon className={`h-6 w-6 md:h-7 md:w-7 ${config.iconColor}`} />
                    </motion.div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary flex items-center justify-center shrink-0"
                      >
                        <Check className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <CardTitle className="text-xl md:text-2xl leading-tight mb-2">
                    {config.title}
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base leading-relaxed">
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {config.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 ${config.iconColor} shrink-0 mt-0.5`} />
                        <span className="text-xs md:text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full h-10 md:h-11 text-sm md:text-base" 
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFormat(format);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {dict.lesson.completed}
                      </>
                    ) : (
                      <>
                        {dict.courses.card.enroll}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
