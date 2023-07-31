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
    LooseProjectNameRequirement,
} from './types'

export const semantics = grammar.createSemantics()

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
semantics.addOperation<any>('extract', {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    File: (linesList): Requirement[] =>
        linesList
            .asIteration()
            .children.map((line) => line.extract())
            .filter(Boolean),
    Line: (req, _comment): Requirement | null => req.child(0)?.extract() || null,

    NameReq: (name, extras, versionSpec, markers): ProjectNameRequirement => ({
        type: 'ProjectName',
        name: name.sourceString,
        versionSpec: versionSpec.extract(),
        extras: extras.child(0)?.extract(),
        environmentMarkerTree: markers.child(0)?.extract(),
    }),
    UrlReq: (name, extras, url, _space, markers): ProjectURLRequirement => ({
        type: 'ProjectURL',
        name: name.sourceString,
        url: url.extract(),
        extras: extras.child(0)?.extract(),
        environmentMarkerTree: markers.child(0)?.extract(),
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

    QuotedMarker: (_semi, marker): string => marker.extract(),
    MarkerOr_node: (left, _or, right): EnvironmentMarkerNode => ({
        operator: 'or',
        left: left.extract(),
        right: right.extract(),
    }),
    MarkerAnd_node: (left, _and, right): EnvironmentMarkerNode => ({
        operator: 'and',
        left: left.extract(),
        right: right.extract(),
    }),
    MarkerExpr_leaf: (left, operator, right): EnvironmentMarkerLeaf => ({
        left: left.sourceString as EnvironmentMarkerVariable | PythonString,
        operator: operator.sourceString as EnvironmentMarkerVersionOperator,
        right: right.sourceString as PythonString | EnvironmentMarkerVariable,
    }),
    MarkerExpr_node: (_open, marker, _close): EnvironmentMarker => marker.extract(),

    VersionSpec_parenthesized: (_open, versionMany, _close): string[] => versionMany.extract() || [],
    VersionMany: (versionOnesList): VersionSpec[] | undefined => {
        const versionOnes = versionOnesList.asIteration().children
        if (versionOnes.length === 0) {
            return undefined
        }
        return versionOnes.map((versionOne) => versionOne.extract())
    },
    VersionOne: (operator, version): VersionSpec => ({
        operator: operator.sourceString as VersionSpec['operator'],
        version: version.sourceString,
    }),
    /* eslint-enable @typescript-eslint/no-unused-vars */
})

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
semantics.addOperation<any>('extractLoosely', {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    LooseFile: (linesList): Requirement[] =>
        linesList
            .asIteration()
            .children.map((line) => line.extractLoosely())
            .filter(Boolean),
    LooseLine: (req, _comment): Requirement | null => req.child(0)?.extractLoosely() || null,

    LooseNameReq: (name, _extras, _versionSpec, _markers): LooseProjectNameRequirement => ({
        type: 'ProjectName',
        name: name.sourceString,
    }),
    LooseNonNameReq: (_) => null,
    /* eslint-enable @typescript-eslint/no-unused-vars */
})

export class RequirementsSyntaxError extends Error {}
