import { Occurrence } from './findings.types';

export interface MakeSecretValue {
    match: {
        api_token: string;
    };
}

export interface MakeOccurrence extends Occurrence {
    secretValue: MakeSecretValue;
    validity?: string;
}

export interface MakeMcpSecretValue {
    match: {
        mcp_token: string;
        full_url: string;
    };
}

export interface MakeMcpOccurrence extends Occurrence {
    secretValue: MakeMcpSecretValue;
    validity?: string;
}

export interface MakeDetectorConfig {
    requiredEntropy: number;
}

export interface MakeValidationResponse {
    valid: boolean;
    error?: string;
}