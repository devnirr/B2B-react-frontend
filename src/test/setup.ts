import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// React Testing Library keeps mounted trees in the document between tests;
// unmount them so each test starts from an empty DOM.
afterEach(() => {
  cleanup()
})
