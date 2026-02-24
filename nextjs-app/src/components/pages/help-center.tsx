'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Search, BookOpen, MessageCircle, Mail, HelpCircle,
  ArrowLeft, ChevronRight, Rocket, Sparkles, User, BookMarked,
  Send, Clock, ThumbsUp, ThumbsDown, FileText, CircleDot
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi } from '@/lib/api/notifications';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { config } from '@/lib/config';

interface HelpCenterProps {
  dict: Dictionary;
}

type ViewMode = 'main' | 'knowledge-base' | 'article' | 'chat' | 'email';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  articles: HelpArticle[];
}

interface FAQ {
  question: string;
  answer: string;
}

interface HelpCenterData {
  title?: string;
  subtitle?: string;
  search_placeholder?: string;
  knowledge_base?: string;
  knowledge_base_desc?: string;
  browse_all?: string;
  chat_support?: string;
  chat_online?: string;
  chat_support_desc?: string;
  start_chat?: string;
  email_support?: string;
  email_support_desc?: string;
  contact_support?: string;
  faq_title?: string;
  no_answer_title?: string;
  no_answer_desc?: string;
  back?: string;
  articles?: string;
  helpful?: string;
  thanks_feedback?: string;
  yes?: string;
  no?: string;
  related_articles?: string;
  chat_greeting?: string;
  chat_auto_reply?: string;
  chat_placeholder?: string;
  chat_support_hours?: string;
  email_form_title?: string;
  email_form_desc?: string;
  email_name?: string;
  email_address?: string;
  email_subject?: string;
  email_message?: string;
  email_send?: string;
  email_sending?: string;
  email_sent_success?: string;
  email_send_error?: string;
  email_fill_fields?: string;
  connecting_operator?: string;
  faqs?: FAQ[];
  kb_categories?: HelpCategory[];
  email_subjects?: string[];
}

const categoryIcons: Record<string, React.ElementType> = {
  rocket: Rocket,
  sparkles: Sparkles,
  user: User,
  book: BookMarked,
};

export function HelpCenter({ dict }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [emailSending, setEmailSending] = useState(false);

  const hc = (dict?.help_center || {}) as HelpCenterData;
  const faqs = hc.faqs || [];
  const kbCategories = hc.kb_categories || [];
  const emailSubjects = hc.email_subjects || [];

  // Chat auto-scroll — прокручиваем только контейнер чата, не всю страницу
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Init chat with greeting
  useEffect(() => {
    if (viewMode === 'chat' && chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        text: hc.chat_greeting || 'Hello! How can we help you?',
        sender: 'support',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: get a snippet around the match
  const getSnippet = useCallback((text: string, q: string, maxLen = 100): string => {
    const lowerText = text.toLowerCase();
    const lowerQuery = q.toLowerCase();
    const idx = lowerText.indexOf(lowerQuery);
    if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? '...' : '');
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + q.length + 60);
    let snippet = '';
    if (start > 0) snippet += '...';
    snippet += text.slice(start, end);
    if (end < text.length) snippet += '...';
    return snippet;
  }, []);

  // Search across all articles AND faqs
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = trimmedQuery.length >= 1
    ? [
      ...kbCategories.flatMap((cat) =>
        (cat.articles || []).filter((a) =>
          a.title.toLowerCase().includes(trimmedQuery) ||
          a.content.toLowerCase().includes(trimmedQuery)
        ).map((a) => ({
          type: 'article' as const,
          id: a.id,
          title: a.title,
          content: a.content,
          snippet: getSnippet(a.content, searchQuery.trim()),
          categoryTitle: cat.title,
          categoryId: cat.id,
        }))
      ),
      ...faqs
        .map((faq, index) => ({ ...faq, index }))
        .filter((faq) =>
          faq.question.toLowerCase().includes(trimmedQuery) ||
          faq.answer.toLowerCase().includes(trimmedQuery)
        )
        .map((faq) => ({
          type: 'faq' as const,
          id: `faq-${faq.index}`,
          title: faq.question,
          content: faq.answer,
          snippet: getSnippet(faq.answer, searchQuery.trim()),
          categoryTitle: hc.faq_title || 'FAQ',
          faqIndex: faq.index,
        }))
    ]
    : [];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user',
      time: now,
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Auto-reply
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: hc.chat_auto_reply || 'Thank you! An operator will respond shortly.',
        sender: 'support',
        time: replyTime,
      }]);
    }, 1500);
  };

  const handleSendEmail = async () => {
    if (!emailForm.name || !emailForm.email || !emailForm.message) {
      toast.error(hc.email_fill_fields || 'Заполните все обязательные поля');
      return;
    }

    setEmailSending(true);
    try {
      await notificationsApi.sendSupportEmail({
        subject: emailForm.subject || `Обращение от ${emailForm.name}`,
        message: `От: ${emailForm.name} (${emailForm.email})\n\n${emailForm.message}`,
      });

      toast.success(hc.email_sent_success || 'Сообщение отправлено! Мы ответим в течение 24 часов.');
      setEmailForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setViewMode('main'), 2000);
    } catch {
      toast.error(hc.email_send_error || 'Ошибка отправки. Попробуйте позже.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleBack = () => {
    if (viewMode === 'article') {
      setViewMode('knowledge-base');
      setSelectedArticle(null);
      setFeedbackGiven(false);
    } else {
      setViewMode('main');
      setSelectedCategory(null);
      setSelectedArticle(null);
      setFeedbackGiven(false);
      setChatMessages([]);
    }
  };

  const openArticle = (article: HelpArticle, category?: HelpCategory) => {
    setSelectedArticle(article);
    if (category) setSelectedCategory(category);
    setViewMode('article');
    setFeedbackGiven(false);
  };

  const handleStartRealChat = (messenger: 'whatsapp' | 'telegram') => {
    const link = messenger === 'whatsapp' ? config.support.whatsapp : config.support.telegram;
    window.open(link, '_blank');
    toast.info(hc.connecting_operator || 'Connecting you to an operator...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-background"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6"
          >
            <HelpCircle className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{hc.title || 'Help Center'}</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {hc.subtitle || 'Find answers to your questions'}
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative" ref={searchContainerRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={hc.search_placeholder || 'Search knowledge base...'}
              className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSearchResults(false);
                  (e.target as HTMLInputElement).blur();
                }
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    const first = searchResults[0];
                    if (first.type === 'faq') {
                      setViewMode('main');
                      setShowSearchResults(false);
                      setSearchQuery('');
                    } else {
                      openArticle(first as unknown as HelpArticle, kbCategories.find((c) => c.id === (first as unknown as { categoryId: string }).categoryId));
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }
                }
              }}
            />
            {searchQuery.trim().length > 0 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
              >
                ✕
              </button>
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border-2 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                >
                  {searchResults.slice(0, 8).map((result) => (
                    <button
                      key={result.id}
                      className="w-full text-left px-5 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3 border-b last:border-0"
                      onClick={() => {
                        if (result.type === 'faq') {
                          setViewMode('main');
                        } else {
                          openArticle(result as unknown as HelpArticle, kbCategories.find((c) => c.id === result.categoryId));
                        }
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      {result.type === 'faq'
                        ? <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        : <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      }
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.snippet}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{result.categoryTitle}</p>
                      </div>
                    </button>
                  ))}
                  {searchResults.length > 8 && (
                    <div className="px-5 py-2 text-xs text-center text-muted-foreground border-t">
                      + {searchResults.length - 8} more
                    </div>
                  )}
                </motion.div>
              )}
              {showSearchResults && searchQuery.trim().length >= 1 && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border-2 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="px-5 py-4 text-sm text-muted-foreground text-center">
                    <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    No results found
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      <section className="py-12 container mx-auto px-4">
        <AnimatePresence mode="wait">

          {/* ===== MAIN VIEW ===== */}
          {viewMode === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Quick Links */}
              <div className="grid md:grid-cols-3 gap-6 mb-16">
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card
                    className="border-2 hover:border-primary transition-all cursor-pointer h-full group hover:shadow-lg"
                    onClick={() => setViewMode('knowledge-base')}
                  >
                    <CardHeader className="pb-3">
                      <div className="h-14 w-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg">{hc.knowledge_base || 'Knowledge Base'}</CardTitle>
                      <CardDescription>{hc.knowledge_base_desc || 'Detailed guides and articles'}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-primary font-medium">
                        {hc.browse_all || 'Browse all'} <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card
                    className="border-2 hover:border-primary transition-all cursor-pointer h-full group hover:shadow-lg"
                    onClick={() => handleStartRealChat('whatsapp')}
                  >
                    <CardHeader className="pb-3">
                      <div className="h-14 w-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <MessageCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                      </div>
                      <CardTitle className="text-lg">
                        <span className="flex items-center gap-2">
                          {hc.chat_support || 'Chat Support'}
                          <Badge variant="outline" className="text-green-600 border-green-300 text-xs text-[10px] md:text-xs">
                            <CircleDot className="h-2 w-2 mr-1 fill-green-500 text-green-500" />
                            {hc.chat_online || 'Online'}
                          </Badge>
                        </span>
                      </CardTitle>
                      <CardDescription>{hc.chat_support_desc || 'Online help 24/7'}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-primary font-medium">
                        {hc.start_chat || 'Start Chat'} <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <Card
                    className="border-2 hover:border-primary transition-all cursor-pointer h-full group hover:shadow-lg"
                    onClick={() => setViewMode('email')}
                  >
                    <CardHeader className="pb-3">
                      <div className="h-14 w-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Mail className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                      </div>
                      <CardTitle className="text-lg">{hc.email_support || 'Email Support'}</CardTitle>
                      <CardDescription>{hc.email_support_desc || 'Response within 24 hours'}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-primary font-medium">
                        {hc.contact_support || 'Contact Support'} <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* FAQ Section */}
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{hc.faq_title || 'FAQ'}</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-2 rounded-xl px-6 bg-card hover:border-primary/30 transition-colors"
                    >
                      <AccordionTrigger className="hover:no-underline py-5">
                        <span className="text-left font-semibold">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Contact CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-16 text-center"
              >
                <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-xl">{hc.no_answer_title || "Didn't find an answer?"}</CardTitle>
                    <CardDescription className="text-base">
                      {hc.no_answer_desc || 'Our support team is always ready to help'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" onClick={() => setViewMode('email')} className="rounded-xl">
                      <Mail className="mr-2 h-5 w-5" />
                      {hc.contact_support || 'Contact Support'}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setViewMode('chat')} className="rounded-xl">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      {hc.start_chat || 'Start Chat'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* ===== KNOWLEDGE BASE VIEW ===== */}
          {viewMode === 'knowledge-base' && (
            <motion.div
              key="kb"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {hc.back || 'Back'}
              </Button>

              <h2 className="text-2xl md:text-3xl font-bold mb-8">
                <BookOpen className="h-7 w-7 inline-block mr-3 text-primary" />
                {hc.knowledge_base || 'Knowledge Base'}
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {kbCategories.map((category) => {
                  const IconComponent = categoryIcons[category.icon] || BookOpen;
                  return (
                    <motion.div
                      key={category.id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg h-full"
                        onClick={() => {
                          setSelectedCategory(category);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{category.title}</CardTitle>
                              <CardDescription className="text-sm">{category.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {(category.articles || []).map((article) => (
                              <button
                                key={article.id}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3 group/item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openArticle(article, category);
                                }}
                              >
                                <FileText className="h-4 w-4 text-muted-foreground group-hover/item:text-primary transition-colors shrink-0" />
                                <span className="text-sm group-hover/item:text-primary transition-colors">{article.title}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                            {(category.articles || []).length} {hc.articles || 'articles'}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===== ARTICLE VIEW ===== */}
          {viewMode === 'article' && selectedArticle && (
            <motion.div
              key="article"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {hc.back || 'Back'}
              </Button>

              {selectedCategory && (
                <Badge variant="outline" className="mb-4">{selectedCategory.title}</Badge>
              )}

              <h2 className="text-2xl md:text-3xl font-bold mb-6">{selectedArticle.title}</h2>

              <Card className="border-2 mb-8">
                <CardContent className="p-6 md:p-8">
                  <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                    {selectedArticle.content}
                  </p>
                </CardContent>
              </Card>

              {/* Feedback */}
              <Card className="border mb-8">
                <CardContent className="p-6 flex items-center justify-between">
                  <span className="text-sm font-medium">{hc.helpful || 'Was this helpful?'}</span>
                  {!feedbackGiven ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setFeedbackGiven(true);
                          toast.success(hc.thanks_feedback || 'Thanks for your feedback!');
                        }}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" /> {hc.yes || 'Yes'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setFeedbackGiven(true);
                          toast.success(hc.thanks_feedback || 'Thanks for your feedback!');
                        }}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" /> {hc.no || 'No'}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ {hc.thanks_feedback || 'Thanks!'}
                    </span>
                  )}
                </CardContent>
              </Card>

              {/* Related articles */}
              {selectedCategory && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">{hc.related_articles || 'Related Articles'}</h3>
                  <div className="space-y-2">
                    {(selectedCategory.articles || [])
                      .filter((a) => a.id !== selectedArticle.id)
                      .map((article) => (
                        <button
                          key={article.id}
                          className="w-full text-left px-4 py-3 rounded-lg border hover:border-primary hover:bg-muted/50 transition-all flex items-center gap-3 group/related"
                          onClick={() => openArticle(article, selectedCategory)}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground group-hover/related:text-primary shrink-0" />
                          <span className="text-sm group-hover/related:text-primary transition-colors">{article.title}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== CHAT SUPPORT VIEW ===== */}
          {viewMode === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {hc.back || 'Back'}
              </Button>

              <Card className="border-2 overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{hc.chat_support || 'Chat Support'}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-green-100">
                      <CircleDot className="h-2.5 w-2.5 fill-green-300 text-green-300" />
                      {hc.chat_online || 'Online'}
                      <span className="mx-1">·</span>
                      <Clock className="h-3 w-3" />
                      {hc.chat_support_hours || 'Mon-Fri 9:00-21:00'}
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div ref={chatContainerRef} className="h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/20">
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border-2 rounded-bl-md'
                        }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          }`}>
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                </div>

                {/* Chat Input */}
                <div className="p-4 border-t bg-card">
                  <div className="flex gap-2">
                    <Input
                      placeholder={hc.chat_placeholder || 'Type your message...'}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                      className="rounded-xl"
                    />
                    <Button
                      onClick={handleSendChat}
                      size="icon"
                      className="rounded-xl shrink-0 h-10 w-10"
                      disabled={!chatInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ===== EMAIL SUPPORT VIEW ===== */}
          {viewMode === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {hc.back || 'Back'}
              </Button>

              <Card className="border-2">
                <CardHeader className="text-center pb-2">
                  <div className="h-14 w-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl">{hc.email_form_title || 'Write to Us'}</CardTitle>
                  <CardDescription>{hc.email_form_desc || 'Fill out the form'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{hc.email_name || 'Your Name'} *</label>
                    <Input
                      placeholder={hc.email_name || 'Your Name'}
                      value={emailForm.name}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, name: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{hc.email_address || 'Email'} *</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{hc.email_subject || 'Subject'}</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    >
                      <option value="">—</option>
                      {emailSubjects.map((subj: string, i: number) => (
                        <option key={i} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{hc.email_message || 'Message'} *</label>
                    <textarea
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[150px] resize-y"
                      placeholder={hc.email_message || 'Message'}
                      value={emailForm.message}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <Button
                    onClick={handleSendEmail}
                    size="lg"
                    className="w-full rounded-xl"
                    disabled={!emailForm.name || !emailForm.email || !emailForm.message || emailSending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {emailSending ? (hc.email_sending || 'Отправка...') : (hc.email_send || 'Отправить сообщение')}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    support@ailearning.com
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
      </section>
    </div>
  );
}