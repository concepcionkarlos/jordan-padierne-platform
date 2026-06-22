'use client'

import Image from 'next/image'
import ContactForm from '@/components/forms/ContactForm'
import BuyerQualificationForm from '@/components/forms/BuyerQualificationForm'
import InvestorForm from '@/components/forms/InvestorForm'
import PreConstructionForm from '@/components/forms/PreConstructionForm'
import SocialIcons from '@/components/ui/SocialIcons'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { Phone, Mail, Clock, MapPin } from 'lucide-react'
import { useT } from '@/components/LanguageProvider'
import { useProfile } from '@/components/ProfileProvider'

export default function ContactContent() {
  const { t } = useT()
  const profile = useProfile()

  const contactInfo = [
    { icon: Phone, label: t('contact.infoCallLabel'), value: profile.phone, href: profile.phoneHref },
    { icon: Mail, label: t('contact.infoEmailLabel'), value: profile.email, href: profile.emailHref },
    { icon: Clock, label: t('contact.infoAvailabilityLabel'), value: t('contact.infoAvailabilityValue'), href: null },
    { icon: MapPin, label: t('contact.infoAreasLabel'), value: profile.areas, href: null },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-900 pt-28 pb-16 relative overflow-hidden">
        <AuroraBackground variant="dark" className="mix-blend-screen" />
        <div className="container-max section-padding text-center relative">
          <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">{t('contact.eyebrow')}</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
            {t('contact.h1Lead')}{' '}
            <span className="text-sky-400">{t('contact.h1Highlight')}</span>
          </h1>
          <p className="text-navy-200 text-lg max-w-xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact info + main form */}
      <section className="py-20 bg-white" id="consultation">
        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact details */}
            <div className="lg:col-span-1">
              <div className="relative rounded-3xl overflow-hidden aspect-square mb-8">
                <Image
                  src="/images/jordan-phone.jpg"
                  alt="Contact Jordan Padierne"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-navy-700" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-navy-900 font-medium hover:text-wine transition-colors text-sm">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-navy-900 font-medium text-sm">{item.value}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 p-5 bg-light-gray rounded-2xl">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('contact.licenseLabel')}</p>
                <p className="text-navy-900 font-semibold text-sm">SL3641062</p>
                <p className="text-gray-500 text-sm">eXp Realty · Florida</p>
                <p className="text-gray-400 text-xs mt-2">English / Español</p>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('contact.followLabel')}</p>
                <SocialIcons variant="contact" />
              </div>
            </div>

            {/* General contact form */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-2">{t('contact.messageTitle')}</h2>
              <p className="text-gray-500 text-sm mb-8">{t('contact.messageSub')}</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Buyer form */}
      <section className="py-20 bg-light-gray" id="buyer-form">
        <div className="container-max section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('contact.buyerEyebrow')}</p>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-3">{t('contact.buyerTitle')}</h2>
              <p className="text-gray-500 text-base">{t('contact.buyerSub')}</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-card">
              <BuyerQualificationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Investor form */}
      <section className="py-20 bg-white" id="investor-form">
        <div className="container-max section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">{t('contact.investorEyebrow')}</p>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-3">{t('contact.investorTitle')}</h2>
              <p className="text-gray-500 text-base">{t('contact.investorSub')}</p>
            </div>
            <div className="bg-light-gray rounded-3xl p-8">
              <InvestorForm />
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Construction form */}
      <section className="py-20 bg-navy-900" id="pre-construction-form">
        <div className="container-max section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-3">{t('contact.preconEyebrow')}</p>
              <h2 className="font-serif text-3xl font-bold text-white mb-3">{t('contact.preconTitle')}</h2>
              <p className="text-navy-200 text-base">{t('contact.preconSub')}</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-premium">
              <PreConstructionForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
