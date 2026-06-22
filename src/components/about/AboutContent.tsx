'use client'

import Image from 'next/image'
import Link from 'next/link'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { CheckCircle2, ArrowRight, Award, Globe, Heart } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'

export default function AboutContent() {
  const { t } = useT()
  const profile = useProfile()

  const highlights = [
    t('about.highlight1'),
    t('about.highlight2'),
    t('about.highlight3'),
    t('about.highlight4'),
    t('about.highlight5'),
    t('about.highlight6'),
  ]

  const values = [
    {
      icon: Heart,
      title: t('about.value1Title'),
      description: t('about.value1Desc'),
    },
    {
      icon: Award,
      title: t('about.value2Title'),
      description: t('about.value2Desc'),
    },
    {
      icon: Globe,
      title: t('about.value3Title'),
      description: t('about.value3Desc'),
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-0 bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900" />
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div className="pb-16 lg:pb-24">
              <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">
                {t('about.eyebrow')}
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {t('about.h1Pre')}{' '}
                <span className="text-sky-400">{t('about.h1Highlight')}</span>
              </h1>
              <p className="text-navy-200 text-lg leading-relaxed max-w-lg">
                {t('about.heroSubtitle')}
              </p>
            </div>
            {/* Photo */}
            <div className="relative self-end">
              <div className="relative h-[420px] lg:h-[520px] rounded-t-3xl overflow-hidden">
                <Image
                  src="/images/jordan-about.jpg"
                  alt="Jordan Padierne"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-4">
                {t('about.storyEyebrow')}
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-6">
                {t('about.storyTitle')}
              </h2>
              <div className="prose prose-gray max-w-none space-y-5 text-gray-600 text-base leading-relaxed">
                <p>
                  {t('about.bioP1')}
                </p>
                <p>
                  {t('about.bioP2')}
                </p>
                <p>
                  {t('about.bioP3')}
                </p>
                <p>
                  {t('about.bioP4')}
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/book" className="btn-wine cta-shine">
                  {t('about.bioCta1')}
                  <ArrowRight size={16} />
                </Link>
                <a href={profile.phoneHref} className="btn-secondary">
                  {t('about.bioCta2')} · {profile.phone}
                </a>
              </div>
            </div>

            <div>
              {/* Highlights */}
              <div className="bg-light-gray rounded-2xl p-8 mb-8">
                <h3 className="font-serif text-xl font-bold text-navy-900 mb-6">
                  {t('about.highlightsTitle')}
                </h3>
                <ul className="space-y-4">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-sky-500 mt-0.5 shrink-0" />
                      <span className="text-navy-700 text-sm leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Values */}
              <div className="space-y-4">
                {values.map((v) => {
                  const Icon = v.icon
                  return (
                    <div key={v.title} className="flex gap-4 p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-navy-700" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 mb-1 text-sm">{v.title}</h4>
                        <p className="text-gray-500 text-sm leading-snug">{v.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 relative overflow-hidden">
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-navy-200 text-lg mb-8 max-w-xl mx-auto">
            {t('about.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-wine">
              {t('about.ctaButton1')}
              <ArrowRight size={16} />
            </Link>
            <Link href="/properties" className="btn-outline-white">
              {t('about.ctaButton2')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
