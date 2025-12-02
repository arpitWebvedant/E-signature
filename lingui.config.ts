import type { LinguiConfig } from '@lingui/conf'
import { formatter } from '@lingui/format-po'

const config: LinguiConfig = {
  // Any changes to these catalogue paths should be reflected in crowdin.yml
  catalogs: [
    {
      path: '<rootDir>/packages/lib/translations/{locale}/web',
      include: [
        'apps/remix/app',
        'packages/ui',
        'packages/lib',
        'packages/email',
      ],
      exclude: ['**/node_modules/**'],
    },
  ],
  compileNamespace: 'es',
  format: formatter({ lineNumbers: false }),
}

export default config
