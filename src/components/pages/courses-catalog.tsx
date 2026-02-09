'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';
import { Course } from '@/lib/api/mock-data';
import { toast } from 'sonner';
import { FadeIn, StaggerContainer, SlideIn } from '@/components/ui/page-transition';
import { DictionaryFallback } from '@/components/ui/dictionary-fallback';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type CoursesCatalogProps = {
  courses: Course[];
  purchasedCourses: string[];
  onPurchaseCourse: (courseId: string) => void;
  onViewCourse: (course: Course) => void;
  dict: Dictionary;
};

export function CoursesCatalog({
  courses,
  purchasedCourses,
  onPurchaseCourse,
  onViewCourse,
  dict
}: CoursesCatalogProps) {
  // Null-safety проверка словаря
  if (!dict?.catalog) {
    return <DictionaryFallback />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...new Set(courses.map(c => c.category))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-blue-500/10 text-blue-500';
      case 'advanced': return 'bg-purple-500/10 text-purple-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return dict.courses.generate.level_beginner;
      case 'intermediate': return dict.courses.generate.level_intermediate;
      case 'advanced': return dict.courses.generate.level_advanced;
      default: return level;
    }
  };

  const isPurchased = (courseId: string) => purchasedCourses.includes(courseId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <FadeIn>
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">{dict.courses.catalog_title}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {dict.courses.catalog_subtitle}
            </p>
          </div>
        </FadeIn>

        {/* Filters */}
        <SlideIn direction="up">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={dict.courses.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Level filter */}
                <div>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>
                        {level === 'all' ? dict.courses.all_levels : getLevelText(level)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category filter */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? dict.courses.all_categories : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Courses Grid */}
        <StaggerContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const purchased = isPurchased(course.id);

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {purchased && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {dict.courses.purchased}
                          </Badge>
                        </div>
                      )}
                      <Badge className={`absolute top-3 left-3 ${getLevelColor(course.level)}`}>
                        {getLevelText(course.level)}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-foreground">{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{course.studentsCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.lessonsCount} {dict.courses.card.lessons}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}{dict.courses.card.hours}</span>
                        </div>
                      </div>

                      {/* Category */}
                      <Badge variant="outline" className="mb-4">
                        {course.category}
                      </Badge>

                      {/* Price */}
                      <div className="mt-auto pt-4 border-t">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">${course.price}</span>
                          <span className="text-muted-foreground">{dict.courses.one_time}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      {purchased ? (
                        <Button
                          className="w-full"
                          onClick={() => onViewCourse(course)}
                        >
                          {dict.courses.open_course}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => {
                            onPurchaseCourse(course.id);
                            toast.success(`${dict.courses.buy_course} "${course.title}" ${dict.toasts.register_success.toLowerCase()}`);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {dict.courses.buy_course}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </StaggerContainer>

        {/* No results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              {dict.courses.no_results}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}