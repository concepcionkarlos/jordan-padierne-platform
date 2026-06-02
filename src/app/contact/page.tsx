import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PublicLayout from '@/components/layout/PublicLayout'
import ContactForm from '@/components/forms/ContactForm'
import BuyerQualificationForm from '@/components/forms/BuyerQualificationForm'
import InvestorForm from '@/components/forms/InvestorForm'
import PreConstructionForm from '@/components/forms/PreConstructionForm'
import SocialIcons from '@/components/ui/SocialIcons'
import { Phone, Mail, Clock, MapPin } from 'lucide-react'
import { CONTACT_INFO } from '@/lib/social'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Jordan Padierne, South Florida Realtor. Schedule a free consultation, request a showing, or fill out our buyer and investor forms.',
}

const contactInfo = [
  { icon: Phone, label: 'Call or Text', value: CONTACT_INFO.phone, href: CONTACT_INFO.phoneHref },
  { icon: Mail, label: 'Email', value: CONTACT_INFO.email, href: CONTACT_INFO.emailHref },
  { icon: Clock, label: 'Availability', value: 'Mon-Sun · 8am – 8pm', href: null },
  { icon: MapPin, label: 'Areas Served', value: CONTACT_INFO.areas, href: null },
]

export default function ContactPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy-900 pt-28 pb-16">
        <div className="container-max section-padding text-center">
          <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-4">Contact</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-6">
            Let&apos;s Find Your{' '}
            <span className="text-sky-400">Next Property</span>
          </h1>
          <p className="text-navy-200 text-lg max-w-xl mx-auto">
            Whether you&apos;re buying, investing, or just exploring — Jordan is ready to help.
            Fill out the form that fits you best, or reach out directly.
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
                  src="/images/jordan-phone.png"
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
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">License</p>
                <p className="text-navy-900 font-semibold text-sm">SL3641062</p>
                <p className="text-gray-500 text-sm">eXp Realty · State of Florida</p>
                <p className="text-gray-400 text-xs mt-2">English / Español</p>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Follow Jordan</p>
                <SocialIcons variant="contact" />
              </div>
            </div>

            {/* General contact form */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-2">Send a Message</h2>
              <p className="text-gray-500 text-sm mb-8">Jordan will respond within 24 hours.</p>
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
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">For Buyers</p>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-3">Buyer Qualification Form</h2>
              <p className="text-gray-500 text-base">Help Jordan understand your search so he can find the right property for you.</p>
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
              <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">For Investors</p>
              <h2 className="font-serif text-3xl font-bold text-navy-900 mb-3">Investor Inquiry Form</h2>
              <p className="text-gray-500 text-base">Share your investment goals and Jordan will prepare a personalized strategy.</p>
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
              <p className="text-sky-400 font-semibold text-sm uppercase tracking-widest mb-3">Pre-Construction</p>
              <h2 className="font-serif text-3xl font-bold text-white mb-3">Register Your Interest</h2>
              <p className="text-navy-200 text-base">Get first access to exclusive pre-construction projects in South Florida.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-premium">
              <PreConstructionForm />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
