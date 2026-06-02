import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, ArrowRight, Calendar } from 'lucide-react'
import SocialIcons from '@/components/ui/SocialIcons'
import { CONTACT_INFO } from '@/lib/social'

export default function ContactCTASection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <p className="text-wine font-semibold text-sm uppercase tracking-widest mb-3">
              Ready to Start?
            </p>
            <h2 className="section-title mb-6">
              Let&apos;s Find Your{' '}
              <span className="text-sky-500">Next Property</span>{' '}
              Together
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Whether you&apos;re buying your first home, expanding your investment portfolio,
              or exploring pre-construction opportunities — Jordan is ready to help you make
              the right move.
            </p>

            {/* Contact options */}
            <div className="space-y-4 mb-8">
              <a
                href="tel:+13057996973"
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Phone size={18} className="text-navy-700" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">Call or Text</p>
                  <p className="text-gray-500 text-sm">305-799-6973</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </a>

              <a
                href={CONTACT_INFO.emailHref}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Mail size={18} className="text-navy-700" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">Send an Email</p>
                  <p className="text-gray-500 text-sm">{CONTACT_INFO.email}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-sky-500 ml-auto transition-colors" />
              </a>
            </div>

            {/* Social links */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Follow Jordan</p>
              <SocialIcons variant="contact" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact#consultation" className="btn-wine">
                <Calendar size={16} />
                Schedule Free Consultation
              </Link>
              <Link href="/contact" className="btn-secondary">
                Send a Message
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-premium aspect-[4/5] max-w-sm mx-auto lg:max-w-none">
              <Image
                src="/images/jordan-phone.png"
                alt="Jordan Padierne — Contact"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
            </div>

            {/* Languages badge */}
            <div className="absolute top-6 -left-4 lg:-left-8 bg-white rounded-2xl p-4 shadow-premium border border-gray-100">
              <p className="font-serif font-bold text-navy-900 text-sm">English · Español</p>
              <p className="text-gray-400 text-xs mt-0.5">Bilingual Service</p>
            </div>

            {/* License badge */}
            <div className="absolute -bottom-4 -right-4 lg:-right-6 bg-navy-900 text-white rounded-xl px-4 py-3 shadow-premium text-xs">
              <p className="font-semibold">License: SL3641062</p>
              <p className="text-navy-300">eXp Realty · Florida</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
