import { Suspense } from 'react'
import Callback from './Callback'

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement de la connexion...</div>}>
      <Callback />
    </Suspense>
  )
}
