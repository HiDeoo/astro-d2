import type { ExpressiveCodeBlock, ExpressiveCodeLine, ExpressiveCodePlugin } from '@astrojs/starlight/expressive-code'

const ecD2Identifier = '```d2'
const ecD2Alias = '```yaml'

export function expressiveCodeD2Plugin(): ExpressiveCodePlugin {
  return {
    name: 'expressive-code-d2-plugin',
    hooks: {
      preprocessCode: ({ codeBlock }) => {
        const marker = getIdentifier(codeBlock, ecD2Identifier)

        if (!marker) {
          return
        }

        marker.line.editText(0, marker.end, ecD2Alias)
      },
      postprocessAnalyzedCode: ({ codeBlock }) => {
        const marker = getIdentifier(codeBlock, ecD2Alias)

        if (!marker) {
          return
        }

        marker.line.editText(0, marker.end, ecD2Identifier)
      },
    },
  }
}

function getIdentifier(codeBlock: ExpressiveCodeBlock, pattern: string): Identifier | undefined {
  if (codeBlock.language !== 'md') {
    return
  }

  const firstLine = codeBlock.getLine(0)

  if (!firstLine) {
    return
  }

  const ecD2MarkerPosition = firstLine.text.indexOf(pattern)

  if (ecD2MarkerPosition === -1) {
    return
  }

  return {
    line: firstLine,
    start: ecD2MarkerPosition,
    end: ecD2MarkerPosition + pattern.length,
  }
}

interface Identifier {
  line: ExpressiveCodeLine
  start: number
  end: number
}
