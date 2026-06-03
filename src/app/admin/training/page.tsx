import TrainingCenter from '@/components/admin/TrainingCenter'

export const metadata = { title: 'Training' }

export default function TrainingPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <TrainingCenter />
    </div>
  )
}
