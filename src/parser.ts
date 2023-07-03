interface ProjectRequirement {
    name: string
    extras: string[]
    environmentMarkers: string[]
}

/** `pip == 22.0.2` */
export interface NameBasedProjectRequirement extends ProjectRequirement {
    constraints: string[]
}

/** `pip @ https://github.com/pypa/pip/archive/22.0.2.zip` */
export interface URLBasedProjectRequirement extends ProjectRequirement {
    url: string
}

/** `-r {path}` */
export interface RequirementsFileRequirement {
    path: string
}

/** `-c {path}` */
export interface ConstraintsFileRequirement {
    path: string
}

export type Requirement =
    | NameBasedProjectRequirement
    | URLBasedProjectRequirement
    | RequirementsFileRequirement
    | ConstraintsFileRequirement

export function parsePipRequirementsFile(fileContent: string): Requirement[] {
    const lines = fileContent.split('\n')
    const parsedLines = lines.map(parsePipRequirementsLine)
    return parsedLines
}

export function parsePipRequirementsLine(lineContent: string): Requirement {
    throw new Error(lineContent)
}
