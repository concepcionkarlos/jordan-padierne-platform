import Image from 'next/image'

// eXp Realty brokerage logo on a clean white badge — works on dark or light
// backgrounds. Single source of truth for the brokerage lockup.
export default function ExpLogo({ className = 'h-5', padded = true }: { className?: string; padded?: boolean }) {
  return (
    <span className={`inline-flex items-center bg-white rounded-lg shadow-sm ${padded ? 'px-2.5 py-1.5' : ''}`}>
      <Image src="/exp-realty-logo.jpeg" alt="eXp Realty" width={1157} height={601} className={`${className} w-auto`} />
    </span>
  )
}
