# pip-requirements-js

A pure JavaScript/TypeScript parser for pip requirements files. Process requirements.txt, constraints.txt, or pip-tools' requirements.in – all without ever leaving JavaScript.

pip-requirements-js strictly adheres to [pip's documentation of the requirements file format](https://pip.pypa.io/en/stable/reference/requirements-file-format/), along with [PEP 508 – Dependency specification for Python Software Packages](https://peps.python.org/pep-0508/). You can sleep well knowing that no dependency will be misinterpreted (if that ever keeps you up at night).

## API

To extract all the packages in a given file, use `parsePipRequirementsFile(fileContent: string): Requirement[]`.

To extract the package on a given line, use `parsePipRequirementsLine(lineContent: string): Requirement | null` (note that `null` will be returned if the line is empty).

In both cases a `RequirementsSyntaxError` will be thrown if the provided content contains invalid syntax.

To make use of the resulting data, look up what `Requirement` is made up of in [`types.ts`](https://github.com/Twixes/pip-requirements-js/blob/main/src/).

## Internals

pip-requirements-js uses the robust parser generator [Ohm.js](https://github.com/ohmjs/ohm), and the core of this library is the [pep-508.ohm](https://github.com/Twixes/pip-requirements-js/blob/main/src/pep-508.ohm) grammar – a straightforward Ohm port of [PEP 508's complete dependency specification grammar](https://peps.python.org/pep-0508/#complete-grammar) (originally defined for Parsley). This ensures the greatest possible compatabibility with what pip itself does.
