import grammar from './pep-508.ohm-bundle'
import {
    Requirement,
    ProjectNameRequirement,
    ProjectURLRequirement,
    RequirementsFileRequirement,
    ConstraintsFileRequirement,
    EnvironmentMarker,
    EnvironmentMarkerNode,
    EnvironmentMarkerLeaf,
    EnvironmentMarkerVersionOperator,
    VersionSpec,
    PythonString,
    EnvironmentMarkerVariable,
} from './types'

export function parsePipRequirementsFile(fileContent: string): Requirement[] {
    const matchResult = grammar.match(fileContent, 'File')
    if (matchResult.failed()) {
        throw new RequirementsSyntaxError(`Failed to parse requirements file: ${matchResult.message}`)
    }
    return semantics(matchResult).parse()
}

export function parsePipRequirementsLine(lineContent: string): Requirement {
    const matchResult = grammar.match(lineContent, 'Line')
    if (matchResult.failed()) {
        throw new RequirementsSyntaxError(`Failed to parse requirements line: ${matchResult.shortMessage}`)
    }
    return semantics(matchResult).parse()
}

const semantics = grammar.createSemantics()
semantics.addOperation<any>('parse', {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    /* eslint-disable @typescript-eslint/no-unused-vars */
    File: (linesList): Requirement[] =>
        linesList
            .asIteration()
            .children.map((line) => line.parse())
            .filter(Boolean),
    Line: (req, _comment): Requirement | null => req.child(0)?.parse(),

    NameReq: (name, extras, versionSpec, markers): ProjectNameRequirement => ({
        type: 'ProjectName',
        name: name.sourceString,
        versionSpec: versionSpec.parse(),
        extras: extras.child(0)?.parse(),
        environmentMarkerTree: markers.child(0)?.parse(),
    }),
    UrlReq: (name, extras, url, _space, markers): ProjectURLRequirement => ({
        type: 'ProjectURL',
        name: name.sourceString,
        url: url.parse(),
        extras: extras.child(0)?.parse(),
        environmentMarkerTree: markers.child(0)?.parse(),
    }),
    Extras: (_open, extrasList, _close): string[] =>
        extrasList.asIteration().children.map((extra) => extra.sourceString),
    RequirementsReq: (_dashR, filePath): RequirementsFileRequirement => ({
        type: 'RequirementsFile',
        path: filePath.sourceString,
    }),
    ConstraintsReq: (_dashC, filePath): ConstraintsFileRequirement => ({
        type: 'ConstraintsFile',
        path: filePath.sourceString,
    }),

    UrlSpec: (_at, uriReference): string => uriReference.sourceString,

    QuotedMarker: (_semi, marker): string => marker.parse(),
    MarkerOr_node: (left, _or, right): EnvironmentMarkerNode => ({
        operator: 'or',
        left: left.parse(),
        right: right.parse(),
    }),
    MarkerAnd_node: (left, _and, right): EnvironmentMarkerNode => ({
        operator: 'and',
        left: left.parse(),
        right: right.parse(),
    }),
    MarkerExpr_leaf: (left, operator, right): EnvironmentMarkerLeaf => ({
        left: left.sourceString as EnvironmentMarkerVariable | PythonString,
        operator: operator.sourceString as EnvironmentMarkerVersionOperator,
        right: right.sourceString as PythonString | EnvironmentMarkerVariable,
    }),
    MarkerExpr_node: (_open, marker, _close): EnvironmentMarker => marker.parse(),

    VersionSpec_parenthesized: (_open, versionMany, _close): string[] => versionMany.parse() || [],
    VersionMany: (versionOnesList): VersionSpec[] | undefined => {
        const versionOnes = versionOnesList.asIteration().children
        if (versionOnes.length === 0) {
            return undefined
        }
        return versionOnes.map((versionOne) => versionOne.parse())
    },
    VersionOne: (operator, version): VersionSpec => ({
        operator: operator.sourceString as VersionSpec['operator'],
        version: version.sourceString,
    }),
    /* eslint-enable @typescript-eslint/no-unused-vars */
})

export class RequirementsSyntaxError extends Error {}
