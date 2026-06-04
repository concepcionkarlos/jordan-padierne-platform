import InsightsSignupPopup from '@/components/insights/InsightsSignupPopup'

// Wraps the whole Insights section so the engagement signup popup shows on the
// listing and on every article — but nowhere else (the consultation modal lives
// on the rest of the site).
export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InsightsSignupPopup />
    </>
  )
}
