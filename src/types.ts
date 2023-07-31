export type Requirement =
    | ProjectNameRequirement
    | ProjectURLRequirement
    | RequirementsFileRequirement
    | ConstraintsFileRequirement

/** @example pip == 22.0.2 */
export interface ProjectNameRequirement extends ProjectRequirementBase {
    type: 'ProjectName'
    versionSpec?: VersionSpec[]
}

/** @example pip @ https://github.com/pypa/pip/archive/22.0.2.zip */
export interface ProjectURLRequirement extends ProjectRequirementBase {
    type: 'ProjectURL'
    url: string
}

interface ProjectRequirementBase {
    name: string
    extras?: string[]
    environmentMarkerTree?: EnvironmentMarker
}

/** @example -r {path} */
export interface RequirementsFileRequirement extends FileRequirementBase {
    type: 'RequirementsFile'
}

/** @example -c {path} */
export interface ConstraintsFileRequirement extends FileRequirementBase {
    type: 'ConstraintsFile'
}

interface FileRequirementBase {
    path: string
}

// Environment markers

export type EnvironmentMarker = EnvironmentMarkerNode | EnvironmentMarkerLeaf

export interface EnvironmentMarkerNode {
    operator: 'and' | 'or'
    left: EnvironmentMarker
    right: EnvironmentMarker
}

export interface EnvironmentMarkerLeaf {
    left: EnvironmentMarkerVariable | PythonString
    operator: EnvironmentMarkerVersionOperator
    right: PythonString | EnvironmentMarkerVariable
}

/** {@link https://peps.python.org/pep-0508/#environment-markers See reference.} */
export enum EnvironmentMarkerVariable {
    /** Python equivalent: `'.'.join(platform.python_version_tuple()[:2])` @example 3.11 */
    PythonVersion = 'python_version',
    /** Python equivalent: `platform.python_version()` @example 3.11.2 */
    PythonFullVersion = 'python_full_version',
    /** Python equivalent: `os.name` @example posix */
    OsName = 'os_name',
    /** Python equivalent: `sys.platform` @example linux */
    SysPlatform = 'sys_platform',
    /** Python equivalent: `platform.release()` @example 3.14.1-x86_64-linode39 */
    PlatformRelease = 'platform_release',
    /** Python equivalent: `platform.system()` @example Windows */
    PlatformSystem = 'platform_system',
    /** Python equivalent: `platform.version()` @example #1 SMP Debian 4.19 */
    PlatformVersion = 'platform_version',
    /** Python equivalent: `platform.machine()` @example x86_64 */
    PlatformMachine = 'platform_machine',
    /** Python equivalent: `platform.python_implementation()` @example CPython */
    PlatformPythonImplementation = 'platform_python_implementation',
    /** Python equivalent: `sys.implementation.name` @example cpython */
    ImplementationName = 'implementation_name',
    /** Python equivalent: processed `sys.implementation.version` @example 3.11.2 */
    ImplementationVersion = 'implementation_version',
    /** An error except when defined by the context interpreting the specification @example test */
    Extra = 'extra',
}

export type PythonString = `"${string}"` | `'${string}'`

export type EnvironmentMarkerVersionOperator = VersionOperator | 'in' | 'not in'

// Version specifiers

/** {@link https://peps.python.org/pep-0440/#arbitrary-equality See reference.} */
export interface VersionSpec {
    operator: VersionOperator
    version: string
}

/** {@link https://peps.python.org/pep-0440/#version-specifiers See reference.} */
export enum VersionOperator {
    /** {@link https://peps.python.org/pep-0440/#compatible-release See reference.} */
    CompatibleRelease = '~=',
    /** {@link https://peps.python.org/pep-0440/#version-matching See reference.} */
    VersionMatching = '==',
    /** {@link https://peps.python.org/pep-0440/#version-exclusion See reference.} */
    VersionExclusion = '!=',
    /** {@link https://peps.python.org/pep-0440/#inclusive-ordered-comparison See reference.} */
    LessThanOrMatching = '<=',
    /** {@link https://peps.python.org/pep-0440/#inclusive-ordered-comparison See reference.} */
    GreaterThanOrMatching = '>=',
    /** {@link https://peps.python.org/pep-0440/#exclusive-ordered-comparison See reference.} */
    LessThan = '<',
    /** {@link https://peps.python.org/pep-0440/#exclusive-ordered-comparison See reference.} */
    GreaterThan = '>',
    /** {@link https://peps.python.org/pep-0440/#arbitrary-equality See reference.} */
    ArbitrarilyEqual = '===',
}

/** Barebones name requirement parsed in loose mode. */
export interface LooseProjectNameRequirement {
    type: 'ProjectName'
    name: string
}
