import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, BookOpen, Users, FileText, MessageSquare, ClipboardCheck, ListChecks } from 'lucide-react';
import type { Course } from '@/types';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type CourseCardProps = {
  course: Course;
  dict: Dictionary;
  locale: Locale;
  onClick?: () => void;
};

const formatIcons = {
  text: FileText,
  quiz: ListChecks,
  chat: MessageSquare,
  assignment: ClipboardCheck,
};

export function CourseCard({ course, dict, locale, onClick }: CourseCardProps) {
  // Защита от undefined
  const formatLabels = {
    text: dict.formats?.text || 'Text',
    quiz: dict.formats?.quiz || 'Quiz',
    chat: dict.formats?.chat || 'Chat',
    assignment: dict.formats?.assignment || 'Assignment',
  };

  return (
    <Card
      className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <ImageWithFallback
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <Badge className="absolute right-2 top-2 capitalize">{course.level}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{course.category}</span>
        </div>
        <h3 className="mb-2 line-clamp-2 h-12 font-medium">{course.title}</h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{(course.studentsCount ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonsCount} {dict.courses.card.lessons}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}h</span>
          </div>
        </div>

        {course.formats && course.formats.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {course.formats.map((format) => {
              const Icon = formatIcons[format];
              return (
                <Badge
                  key={format}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  <Icon className="h-3 w-3" />
                  {formatLabels[format]}
                </Badge>
              );
            })}
          </div>
        )}

        {course.isEnrolled && course.progress !== undefined && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{dict.progress.overall}</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full"
        >
          {course.isEnrolled ? dict.courses.card.continue : dict.courses.card.enroll}
        </Button>
      </CardFooter>
    </Card>
  );
}