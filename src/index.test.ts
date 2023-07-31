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
    it('should return null for a comment', () => {
        const requirement = parsePipRequirementsLine(' # xyz ')
        expect(requirement).toBeNull()
    })
    it('should return null for a blank line', () => {
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
        })
    })
    it('should parse an in-flight requirement with a random environment marker', () => {
        const requirement = parsePipRequirementsLineLoosely('hope = 2.0 ; xds')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'hope',
        })
    })
    it('should parse a name-based project requirement with extras, environment markers, and a comment', () => {
        const requirement = parsePipRequirementsLineLoosely('pip[foo,bar]; python_version == "2.7" # xyz ')
        expect(requirement).toEqual({
            type: 'ProjectName',
            name: 'pip',
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
})
