'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, BookOpen, MessageCircle, Mail, Phone, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface HelpCenterProps {
  dict: Dictionary;
}

export function HelpCenter({ dict }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Handlers
  const handleKnowledgeBaseClick = () => {
    toast.info(dict?.toasts?.knowledge_base_dev || 'Knowledge base in development. Full documentation will be available soon!');
  };

  const handleChatSupportClick = () => {
    toast.success(dict?.toasts?.chat_support_opening || 'Opening chat support... In production, there will be chat integration.');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@ailearning.com';
  };

  const handleSupportEmailClick = () => {
    toast.success(dict?.toasts?.support_form_opening || 'Support form is opening...');
    // В будущем здесь будет модальное окно с формой
  };

  const handleStartChatClick = () => {
    toast.success(dict?.toasts?.connecting_operator || 'Connecting you to an operator...');
    // В будущем здесь будет интеграция с live chat
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.info(`${dict?.common?.search || 'Search'}: "${searchQuery}". ${dict?.toasts?.knowledge_base_dev || 'Feature in development.'}`);
    }
  };

  // Используем переводы из словаря
  const faqs = dict?.help_center?.faqs || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-background"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6"
          >
            <HelpCircle className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="mb-4">{dict?.help_center?.title || 'Help Center'}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {dict?.help_center?.subtitle || 'Find answers to frequently asked questions or contact our support'}
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={dict?.help_center?.search_placeholder || 'Search knowledge base...'}
              className="pl-12 h-14 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
      </motion.section>

      {/* Quick Links */}
      <section className="py-12 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={handleKnowledgeBaseClick}>
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-3" />
              <CardTitle>{dict?.help_center?.knowledge_base || 'Knowledge Base'}</CardTitle>
              <CardDescription>
                {dict?.help_center?.knowledge_base_desc || 'Detailed guides and articles'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={handleChatSupportClick}>
            <CardHeader>
              <MessageCircle className="h-10 w-10 text-primary mb-3" />
              <CardTitle>{dict?.help_center?.chat_support || 'Chat Support'}</CardTitle>
              <CardDescription>
                {dict?.help_center?.chat_support_desc || 'Online help 24/7'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors cursor-pointer" onClick={handleEmailClick}>
            <CardHeader>
              <Mail className="h-10 w-10 text-primary mb-3" />
              <CardTitle>{dict?.help_center?.email_support || 'Email Support'}</CardTitle>
              <CardDescription>
                support@ailearning.com
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="mb-8 text-center">{dict?.help_center?.faq_title || 'Frequently Asked Questions'}</h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>{dict?.help_center?.no_answer_title || "Didn't find an answer?"}</CardTitle>
              <CardDescription>
                {dict?.help_center?.no_answer_desc || 'Our support team is always ready to help'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" onClick={handleSupportEmailClick}>
                <Mail className="mr-2 h-5 w-5" />
                {dict?.help_center?.contact_support || 'Contact Support'}
              </Button>
              <Button variant="outline" size="lg" onClick={handleStartChatClick}>
                <MessageCircle className="mr-2 h-5 w-5" />
                {dict?.help_center?.start_chat || 'Start Chat'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}