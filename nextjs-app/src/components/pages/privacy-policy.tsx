'use client';

import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface PrivacyPolicyProps {
  dict: Dictionary;
}

export function PrivacyPolicy({ dict }: PrivacyPolicyProps) {
  const { privacyPolicy: t } = dict;
  
  return (
    <div className="min-h-screen bg-background">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-background"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 mb-6"
          >
            <Shield className="h-8 w-8 text-blue-500" />
          </motion.div>
          <h1 className="mb-4">{t.title}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {t.last_updated}
          </p>
        </div>
      </motion.section>

      <section className="py-12 container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>{t.section1_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{t.section1_intro}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t.section1_item1}</li>
                <li>{t.section1_item2}</li>
                <li>{t.section1_item3}</li>
                <li>{t.section1_item4}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle>{t.section2_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{t.section2_intro}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t.section2_item1}</li>
                <li>{t.section2_item2}</li>
                <li>{t.section2_item3}</li>
                <li>{t.section2_item4}</li>
                <li>{t.section2_item5}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <CardTitle>{t.section3_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{t.section3_intro}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t.section3_item1}</li>
                <li>{t.section3_item2}</li>
                <li>{t.section3_item3}</li>
                <li>{t.section3_item4}</li>
                <li>{t.section3_item5}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle>{t.section4_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{t.section4_intro}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>{t.section4_item1}</li>
                <li>{t.section4_item2}</li>
                <li>{t.section4_item3}</li>
                <li>{t.section4_item4}</li>
                <li>{t.section4_item5}</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-pink-500" />
                </div>
                <CardTitle>{t.section5_title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{t.section5_p1}</p>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>{t.contact}</strong> {t.contact_text}{' '}
                <a href={`mailto:${t.contact_email}`} className="text-primary hover:underline">{t.contact_email}</a>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
