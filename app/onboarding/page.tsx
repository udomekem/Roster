import { OnboardingForm } from '@/modules/organisations/components/onboarding-form'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
            R
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Set up your organisation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tell us about your disability support provider organisation.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
