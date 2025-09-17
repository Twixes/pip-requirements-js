import { parsePipRequirementsLine, parsePipRequirementsLineLoosely } from '.'

describe('parsePipRequirementsLine', () => {
    it('should parse a version matching name-based project requirement', () => {
        const requirement = parsePipRequirementsLine('pip == 22.0.2')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                {
                    operator: '==',
                    version: '22.0.2',
                },
            ],
        })
    })
    it('should parse a parenthesized version matching name-based project requirement', () => {
        const requirement = parsePipRequirementsLine('pip ( == 22.0.2 )')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                {
                    operator: '==',
                    version: '22.0.2',
                },
            ],
        })
    })
    it('should parse a parenthesized empty version spec name-based project requirement', () => {
        const requirement = parsePipRequirementsLine('pip()')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [], // This is not undefined because of the parentheses
        })
    })
    it('should parse a URL-based project requirement', () => {
        const requirement = parsePipRequirementsLine('pip @ https://x.com/y.zip')
        expect(requirement).toEqual({
            type: 'ProjectURL',
            name: 'pip',
            url: 'https://x.com/y.zip',
        })
    })
    it('should parse a requirements file requirement', () => {
        const requirement = parsePipRequirementsLine('-r requirements.txt')
        expect(requirement).toEqual({
            type: 'RequirementsFile',
            path: 'requirements.txt',
        })
    })
    it('should parse a constraints file requirement', () => {
        const requirement = parsePipRequirementsLine('-c versionSpec.txt')
        expect(requirement).toEqual({
            type: 'ConstraintsFile',
            path: 'versionSpec.txt',
        })
    })
    it('should parse a name-based project requirement with extras', () => {
        const requirement = parsePipRequirementsLine('pip[foo,bar] == 22.0.2')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                {
                    operator: '==',
                    version: '22.0.2',
                },
            ],
            extras: ['foo', 'bar'],
        })
    })
    it('should parse a name-based project requirement with environment markers', () => {
        const requirement = parsePipRequirementsLine('pip; python_version == "2.7"')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            environmentMarkerTree: { left: 'python_version', operator: '==', right: '"2.7"' },
        })
    })
    it('should parse a name-based project requirement with extras, environment markers, and a comment', () => {
        const requirement = parsePipRequirementsLine('pip[foo,bar]; python_version == "2.7" # xyz ')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['foo', 'bar'],
            environmentMarkerTree: { left: 'python_version', operator: '==', right: '"2.7"' },
        })
    })
    it('should ignore a comment', () => {
        const requirement = parsePipRequirementsLine(' # xyz ')
        expect(requirement).toBeNull()
    })
    it('should ignore a blank line', () => {
        const requirement = parsePipRequirementsLine('')
        expect(requirement).toBeNull()
    })
    it('should throw an error if the syntax is wrong', () => {
        expect(() => parsePipRequirementsLine('pip???')).toThrowError(
            'Failed to parse requirements line. Line 1, col 4: expected end of input'
        )
    })
})

describe('parsePipRequirementLineLoosely', () => {
    it('should parse a basic in-flight requirement', () => {
        const requirement = parsePipRequirementsLineLoosely('pip = ')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '=' }],
        })
    })
    it('should parse a requirement with multiple version specs', () => {
        const requirement = parsePipRequirementsLineLoosely('pip>=2,<3')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                { operator: '>=', version: '2' },
                { operator: '<', version: '3' },
            ],
        })
    })
    it('should parse an in-flight requirement with a random environment marker', () => {
        const requirement = parsePipRequirementsLineLoosely('hope = 2.0 ; xds')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'hope',
            versionSpec: [{ operator: '=', version: '2.0' }],
        })
    })
    it('should parse a name-based project requirement with extras, environment markers, and a comment', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[foo,bar]; python_version == "2.7" # xyz ')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['foo', 'bar'],
        })
    })
    it('should ignore a URL-based project requirement', () => {
        const requirement = parsePipRequirementsLineLoosely('pip @ https://x.com/y.zip')
        expect(requirement).toBeNull()
    })
    it('should ignore a requirements file requirement', () => {
        const requirement = parsePipRequirementsLineLoosely('-r requirements.txt')
        expect(requirement).toBeNull()
    })
    it('should ignore a comment-only requirement', () => {
        const requirement = parsePipRequirementsLineLoosely('# text')
        expect(requirement).toBeNull()
    })

    // Edge cases for incomplete version operators
    it('should parse incomplete version operators without versions', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>' }],
        })
    })
    it('should parse multiple incomplete version operators', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >=, <')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=' }, { operator: '<' }],
        })
    })
    it('should parse malformed version operators', () => {
        const requirement = parsePipRequirementsLineLoosely('pip =!')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '=!' }],
        })
    })
    it('should parse repeated operator characters', () => {
        const requirement = parsePipRequirementsLineLoosely('pip ===1.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '===', version: '1.0' }],
        })
    })

    // Edge cases for incomplete extras
    it('should parse extras with missing closing bracket', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[extra1,extra2')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['extra1', 'extra2'],
        })
    })
    it('should parse empty extras with missing closing bracket', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: [],
        })
    })
    it('should parse extras with trailing comma', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[extra1,extra2,]')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['extra1', 'extra2'],
        })
    })

    // Edge cases for incomplete parentheses in version specs
    it('should parse parenthesized version spec with missing closing paren', () => {
        const requirement = parsePipRequirementsLineLoosely('pip (>=1.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should parse empty parentheses with missing closing paren', () => {
        const requirement = parsePipRequirementsLineLoosely('pip (')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [],
        })
    })
    it('should parse version spec with trailing comma in parentheses', () => {
        const requirement = parsePipRequirementsLineLoosely('pip (>=1.0,<2.0,)')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                { operator: '>=', version: '1.0' },
                { operator: '<', version: '2.0' },
            ],
        })
    })

    // Whitespace handling edge cases
    it('should handle excessive whitespace', () => {
        const requirement = parsePipRequirementsLineLoosely('  pip   [  extra1  ,  extra2  ]   >=   1.0  ')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['extra1', 'extra2'],
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should handle tabs and mixed whitespace', () => {
        const requirement = parsePipRequirementsLineLoosely('\tpip\t>=\t1.0\t')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })

    // Empty and minimal requirements
    it('should parse just a package name', () => {
        const requirement = parsePipRequirementsLineLoosely('pip')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
        })
    })
    it('should parse package name with just empty parentheses', () => {
        const requirement = parsePipRequirementsLineLoosely('pip()')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [],
        })
    })
    it('should parse package name with just empty brackets', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[]')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: [],
        })
    })
    it('should ignore empty lines', () => {
        const requirement = parsePipRequirementsLineLoosely('')
        expect(requirement).toBeNull()
    })
    it('should ignore whitespace-only lines', () => {
        const requirement = parsePipRequirementsLineLoosely('   \t   ')
        expect(requirement).toBeNull()
    })

    // Complex edge cases combining multiple incomplete elements
    it('should parse complex incomplete requirement with everything partial', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[extra1,extra2 (>=1.0,<; some invalid marker')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['extra1', 'extra2'],
            versionSpec: [{ operator: '>=', version: '1.0' }, { operator: '<' }],
        })
    })
    it('should parse version specs with mixed completeness', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >=1.0, <, !=2.0, >')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                { operator: '>=', version: '1.0' },
                { operator: '<' },
                { operator: '!=', version: '2.0' },
                { operator: '>' },
            ],
        })
    })

    // Package names with special characters
    it('should parse package names with hyphens and underscores', () => {
        const requirement = parsePipRequirementsLineLoosely('my-package_name >= 1.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'my-package_name',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should parse package names with dots', () => {
        const requirement = parsePipRequirementsLineLoosely('my.package.name == 1.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'my.package.name',
            versionSpec: [{ operator: '==', version: '1.0' }],
        })
    })

    // Version strings with special characters
    it('should parse versions with special characters', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1.0.0-alpha.1+build.123')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1.0.0-alpha.1+build.123' }],
        })
    })
    it('should parse versions with wildcards', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1.0.*')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1.0.*' }],
        })
    })

    // Progressive typing scenarios - character by character
    it('should parse single character package names', () => {
        const requirement = parsePipRequirementsLineLoosely('a')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'a',
        })
    })
    it('should parse partial package names being typed', () => {
        const requirement = parsePipRequirementsLineLoosely('requ')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'requ',
        })
    })
    it('should parse package name with start of version operator', () => {
        const requirement = parsePipRequirementsLineLoosely('pip =')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '=' }],
        })
    })
    it('should parse package name with partial double equals', () => {
        const requirement = parsePipRequirementsLineLoosely('pip ==')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==' }],
        })
    })
    it('should parse package name with incomplete version number', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1' }],
        })
    })
    it('should parse package name with partial dot version', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1.')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1.' }],
        })
    })
    it('should parse package name with partial second version number', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1.2')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1.2' }],
        })
    })

    // Auto-completion scenarios
    it('should parse package name with opening bracket for extras', () => {
        const requirement = parsePipRequirementsLineLoosely('requests[')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'requests',
            extras: [],
        })
    })
    it('should parse package name with partial extra being typed', () => {
        const requirement = parsePipRequirementsLineLoosely('requests[sec')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'requests',
            extras: ['sec'],
        })
    })
    it('should parse package name with complete extra and comma', () => {
        const requirement = parsePipRequirementsLineLoosely('requests[security,')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'requests',
            extras: ['security'],
        })
    })
    it('should parse package name with opening parenthesis for version', () => {
        const requirement = parsePipRequirementsLineLoosely('pip (')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [],
        })
    })
    it('should parse package name with opening parenthesis and partial operator', () => {
        const requirement = parsePipRequirementsLineLoosely('pip (>')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>' }],
        })
    })

    // Typos and corrections
    it('should parse package name with wrong operator being corrected', () => {
        const requirement = parsePipRequirementsLineLoosely('pip =<')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '=<' }],
        })
    })
    it('should parse package name with double operators', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >>>')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>>>' }],
        })
    })
    it('should parse package name with mixed operator characters', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >=<')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=<' }],
        })
    })
    it('should parse package name with incomplete version after space', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1.')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1.' }],
        })
    })

    // Copy-paste fragments and partial inputs
    it('should parse incomplete requirements line ending abruptly', () => {
        const requirement = parsePipRequirementsLineLoosely('django>=3.2,<4.0,!=3.2.1')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'django',
            versionSpec: [
                { operator: '>=', version: '3.2' },
                { operator: '<', version: '4.0' },
                { operator: '!=', version: '3.2.1' },
            ],
        })
    })
    it('should parse requirement with dangling comma', () => {
        const requirement = parsePipRequirementsLineLoosely('pip>=1.0,')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should parse requirement with multiple dangling commas', () => {
        const requirement = parsePipRequirementsLineLoosely('pip>=1.0,,,')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should parse requirement with space before comma', () => {
        const requirement = parsePipRequirementsLineLoosely('pip>=1.0 ,<2.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [
                { operator: '>=', version: '1.0' },
                { operator: '<', version: '2.0' },
            ],
        })
    })

    // Complex progressive typing with multiple elements
    it('should parse progressive complex requirement building', () => {
        const requirement = parsePipRequirementsLineLoosely('requests[security,socks](>=2.25.1,<3.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'requests',
            extras: ['security', 'socks'],
            versionSpec: [
                { operator: '>=', version: '2.25.1' },
                { operator: '<', version: '3.0' },
            ],
        })
    })
    it('should parse package with extras and incomplete version in parentheses', () => {
        const requirement = parsePipRequirementsLineLoosely('package[extra](==')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'package',
            extras: ['extra'],
            versionSpec: [{ operator: '==' }],
        })
    })
    it('should parse package with incomplete extras and version', () => {
        const requirement = parsePipRequirementsLineLoosely('package[extra>=1.0')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'package',
            extras: ['extra'],
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })

    // Edge cases with numbers and special characters in names/versions
    it('should parse package names starting with numbers', () => {
        const requirement = parsePipRequirementsLineLoosely('2to3')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: '2to3',
        })
    })
    it('should parse package names with numbers and special chars', () => {
        const requirement = parsePipRequirementsLineLoosely('py2-ipaddress >= 3.4')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'py2-ipaddress',
            versionSpec: [{ operator: '>=', version: '3.4' }],
        })
    })
    it('should parse alpha/beta/rc versions being typed', () => {
        const requirement = parsePipRequirementsLineLoosely('package == 1.0a')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'package',
            versionSpec: [{ operator: '==', version: '1.0a' }],
        })
    })
    it('should parse dev versions being typed', () => {
        const requirement = parsePipRequirementsLineLoosely('package == 1.0.dev')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'package',
            versionSpec: [{ operator: '==', version: '1.0.dev' }],
        })
    })

    // Realistic backspacing scenarios (what's left after partial deletion)
    it('should parse after backspacing part of version', () => {
        const requirement = parsePipRequirementsLineLoosely('pip == 1.0.')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '==', version: '1.0.' }],
        })
    })
    it('should parse after backspacing closing bracket', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[extra')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            extras: ['extra'],
        })
    })
    it('should parse after backspacing part of operator', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>' }],
        })
    })

    // Environment marker edge cases
    it('should parse with incomplete environment marker', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >= 1.0 ; python_version')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should parse with semicolon but no marker', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >= 1.0 ;')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
    it('should parse with semicolon and partial marker text', () => {
        const requirement = parsePipRequirementsLineLoosely('pip >= 1.0 ; sys_plat')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
            versionSpec: [{ operator: '>=', version: '1.0' }],
        })
    })
})
