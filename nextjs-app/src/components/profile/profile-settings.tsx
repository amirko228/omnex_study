'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Upload, Camera, Award, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { AnimatedCard } from '@/components/ui/animated-elements';

type ProfileSettingsProps = {
  dict: Dictionary;
  locale: Locale;
  user: import('@/types').User | null;
};

export function ProfileSettings({ dict, locale, user }: ProfileSettingsProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(dict.profileSettings?.default_bio || 'Увлеченный студент, изучающий новые технологии и совершенствующий свои навыки в области программирования и ИИ.');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      toast.success(dict.profile.profile_updated);
    }, 1000);
  };

  const handleAvatarChange = () => {
    // Simulate file upload
    toast.info(dict.profileSettings.choose_image);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      toast.success(dict.profileSettings?.avatar_updated || 'Фото профиля обновлено!');
      // In real app, upload to server and get URL
      const fakeUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
      setAvatarUrl(fakeUrl);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <FadeIn>
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{dict.profile.title}</h1>
          <p className="text-muted-foreground text-lg">
            {dict.profileSettings?.subtitle || dict.profile.subtitle}
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Profile Stats */}
        <div className="lg:col-span-1">
          <StaggerContainer className="space-y-6">
            {/* Profile Card */}
            <StaggerItem>
              <AnimatedCard hoverable>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative group mb-4">
                      <Avatar className="h-24 w-24 border-4 border-border">
                        <AvatarImage src={avatarUrl} alt={name} />
                        <AvatarFallback className="text-2xl">
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleAvatarChange}
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="h-4 w-4" />
                      </motion.button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{name}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{email}</p>
                    <Badge variant="secondary" className="mb-4">
                      {user?.plan ? (dict.profileSettings?.plan_badge?.[user.plan] || user.plan) : 'Free'}
                    </Badge>
                  </div>
                </CardContent>
              </AnimatedCard>
            </StaggerItem>

            {/* Stats */}
            <StaggerItem>
              <AnimatedCard>
                <CardHeader>
                  <CardTitle className="text-lg">{dict.profileSettings?.learning_stats || 'Статистика обучения'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">5</div>
                        <div className="text-xs text-muted-foreground">{dict.profileSettings?.stats_courses || 'Курсов'}</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">124</div>
                        <div className="text-xs text-muted-foreground">{dict.profileSettings?.stats_hours || 'Часов'}</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-between p-3 rounded-lg bg-green-500/5"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Award className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-xs text-muted-foreground">{dict.profileSettings?.stats_certificates || 'Сертификатов'}</div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </AnimatedCard>
            </StaggerItem>
          </StaggerContainer>
        </div>

        {/* Right column - Profile Form */}
        <div className="lg:col-span-2">
          <SlideIn direction="right">
            <AnimatedCard hoverable>
              <CardHeader>
                <CardTitle>{dict.profile.personal_info}</CardTitle>
                <CardDescription>{dict.profileSettings?.personal_info_desc || 'Обновите вашу личную информацию и био'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload (mobile view) */}
                <div className="lg:hidden">
                  <Label>{dict.profile.avatar}</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarChange}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {dict.profile.change_avatar}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dict.profileSettings?.avatar_format || 'JPG, PNG до 2MB'}
                      </p>
                    </div>
                  </div>
                  <Separator className="mt-6" />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {dict.profile.name}
                    </div>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={dict.profileSettings?.name_placeholder || 'Введите ваше имя'}
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {dict.profile.email}
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    {dict.profileSettings?.email_desc || 'Ваш email используется для входа и важных уведомлений'}
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">{dict.profile.bio}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={dict.profileSettings?.bio_placeholder || 'Расскажите о себе...'}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length} / 500 {dict.profileSettings?.characters || 'символов'}
                  </p>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                    toast.info(dict.profileSettings?.changes_cancelled || 'Изменения отменены');
                  }}>
                    {dict.profileSettings?.cancel || 'Отмена'}
                  </Button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (dict.profileSettings?.saving || 'Сохранение...') : dict.profile.save}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </AnimatedCard>
          </SlideIn>
        </div>
      </div>
    </div>
  );
}