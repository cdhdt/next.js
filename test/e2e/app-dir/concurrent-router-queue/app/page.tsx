import Link from 'next/link'
import { greet } from './actions'
import { ActionButton, WindowErrorProbe } from './client-components'

export default function Page() {
  return (
    <>
      <p>home</p>
      <Link href="/target" id="to-target">
        Go to target
      </Link>
      <ActionButton action={greet} />
      <WindowErrorProbe />
    </>
  )
}
