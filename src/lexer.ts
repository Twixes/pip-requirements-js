interface SourceLocation {
    start: {
        line: number
        column: number
    }
    end: {
        line: number
        column: number
    }
}

interface Token {
    value: string
    location: SourceLocation
}

function lex(text: string): Token[] {
    throw new Error(text)
}
