export class AstaError extends Error {}

export class ProtocolError extends AstaError {}
export class ChainAgnosticError extends ProtocolError {}

export class ExpectingTestToFail extends Error {}

export class InvalidChainAgnosticArgument extends ChainAgnosticError {
    constructor(propertyName: string, propertyValue: string, parentName = '') {
        super(
            `Invalid argument (${parentName}${propertyName} does not accept '${propertyValue}' as value)`
        );
    }
}

export class MissingChainAgnosticArgument extends ChainAgnosticError {
    constructor(propertyName: string) {
        super(`Missing argument (${propertyName} not provided)`);
    }
}

export class FailedFormatDueToMissingArgument extends ChainAgnosticError {
    constructor(propertyName: string) {
        super(`Failed to format, ${propertyName} is missing`);
    }
}

export class ManipulatorError extends ProtocolError {}

export class SelectorError extends ManipulatorError {}
export class UnsupportedSelectorSpecError extends SelectorError {
    constructor(val: unknown) {
        super(`Selection against the spec is not supported, spec: ${val}`);
    }
}

export class SchemaValidatorError extends ManipulatorError {}

export class MissingSelectorSpec extends ManipulatorError {
    constructor() {
        super('Selector spec is missing');
    }
}

export class IncompatibleEncoding extends ProtocolError {
    constructor(algoName: string, data: string) {
        super(
            `${data} is not compatible with encoding algorithm "${algoName}"`
        );
    }
}

export class ProtocolDataDecodingError extends ProtocolError {
    constructor(data: string, err?: string) {
        super(`Unable to decode ${data} because of ${err}`);
    }
}

export class ProtocolDataEncodingError extends ProtocolError {
    constructor(data: unknown, err?: string) {
        super(`Unable to encode ${data} due to ${err}`);
    }
}
