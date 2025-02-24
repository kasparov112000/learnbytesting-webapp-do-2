export enum ApiResponseMessage {
    success = 'Request successful',
    exception = 'Request responded with exceptions.',
    unAuthorized = 'Request denied.',
    validationError = 'Request responded with validation error(s).',
    failure = 'Unable to process the request.',
}  