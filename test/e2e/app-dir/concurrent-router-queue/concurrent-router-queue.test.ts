import { nextTestSetup } from 'e2e-utils'

// `experimental.concurrentRouterQueue` swaps the router's entry-point modules
// (the navigator and the callServer action door) for the concurrent
// implementations at the bundler level. The concurrent implementations are
// currently stubs that throw a distinctive error from every operation, so
// this suite verifies the fork wiring: the app boots on the concurrent
// modules without touching them, and every old-world entry point fails
// loudly instead of silently running the sequential implementation.
describe('concurrent-router-queue', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('hydrates cleanly without invoking the forked entry points', async () => {
    const browser = await next.browser('/')
    expect(await browser.elementByCss('p').text()).toBe('home')
    // Hydration is complete once the client components are interactive.
    await browser.waitForElementByCss('#invoke-action')
    // Nothing at boot may call into the stubs.
    expect(await browser.elementByCss('#window-error-count').text()).toBe('0')
  })

  it('fails loudly on link navigation', async () => {
    const browser = await next.browser('/')
    await browser.waitForElementByCss('#invoke-action')

    await browser.elementByCss('#to-target').click()

    // The stub throws synchronously inside the click handler, which surfaces
    // as an uncaught window error. The error list is empty (and hidden) until
    // the probe records it, so elementByCss waits for it to appear.
    expect(await browser.elementByCss('#window-errors').text()).toContain(
      'Not implemented: this behavior is not yet supported when ' +
        '`experimental.concurrentRouterQueue` is enabled.'
    )

    // No navigation happened, soft or hard: Link calls preventDefault()
    // before dispatching, and the stub throws before any router state or
    // pending-URL bookkeeping, so there is no fallback hard navigation.
    expect(new URL(await browser.url()).pathname).toBe('/')
  })

  it('fails loudly on server action invocation', async () => {
    const browser = await next.browser('/')
    await browser.waitForElementByCss('#invoke-action')

    await browser.elementByCss('#invoke-action').click()

    // callServer is async, so the stub surfaces as a rejection of the
    // promise returned to the action caller. The result element is empty
    // (and hidden) until the rejection renders, so elementByCss waits for
    // it to appear.
    expect(await browser.elementByCss('#action-result').text()).toContain(
      'rejected: Not implemented: this behavior is not yet supported when ' +
        '`experimental.concurrentRouterQueue` is enabled.'
    )
  })
})
