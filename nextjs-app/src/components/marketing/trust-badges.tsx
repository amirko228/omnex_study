'use client';

import { motion } from 'motion/react';
import { Shield, Lock, Award, Users, Zap, Heart } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface TrustBadgesProps {
  dict: Dictionary;
}

export function TrustBadges({ dict }: TrustBadgesProps) {
  const badges = [
    {
      icon: Shield,
      title: dict.trustBadges.data_protection,
      description: dict.trustBadges.ssl_encryption
    },
    {
      icon: Lock,
      title: dict.trustBadges.secure_payments,
      description: dict.trustBadges.pci_certified
    },
    {
      icon: Award,
      title: dict.trustBadges.quality_courses,
      description: dict.trustBadges.expert_verified
    },
    {
      icon: Users,
      title: dict.trustBadges.students_count,
      description: dict.trustBadges.trust_us
    },
    {
      icon: Zap,
      title: dict.trustBadges.instant_access,
      description: dict.trustBadges.start_in_minutes
    },
    {
      icon: Heart,
      title: dict.trustBadges.money_back,
      description: dict.trustBadges.refund
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">
            {dict.trustBadges.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dict.trustBadges.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-background border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className="h-12 w-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center p-6 bg-background border border-border rounded-xl">
            <div className="text-3xl font-bold text-primary mb-1">4.9/5</div>
            <div className="text-sm text-muted-foreground">{dict.trustBadges.average_rating}</div>
          </div>
          <div className="text-center p-6 bg-background border border-border rounded-xl">
            <div className="text-3xl font-bold text-primary mb-1">50K+</div>
            <div className="text-sm text-muted-foreground">{dict.trustBadges.active_students}</div>
          </div>
          <div className="text-center p-6 bg-background border border-border rounded-xl">
            <div className="text-3xl font-bold text-primary mb-1">1000+</div>
            <div className="text-sm text-muted-foreground">{dict.trustBadges.ai_courses}</div>
          </div>
          <div className="text-center p-6 bg-background border border-border rounded-xl">
            <div className="text-3xl font-bold text-primary mb-1">95%</div>
            <div className="text-sm text-muted-foreground">{dict.trustBadges.completion_rate}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}