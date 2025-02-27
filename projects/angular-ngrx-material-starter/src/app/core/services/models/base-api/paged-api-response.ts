import { ApiResponse } from './api-response';

export class PagedApiResponse<TResponse> extends ApiResponse<TResponse> {
    public count: number;
    constructor(result?: TResponse, count?: number) {
        super(result);
        this.count = count;
    }
}