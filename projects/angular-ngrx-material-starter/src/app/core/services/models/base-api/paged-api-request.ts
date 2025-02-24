import { SortedApiRequest } from './sorted-api-request';

export class PagedApiRequest extends SortedApiRequest {
    public page?: number;
    public pageSize?: number;

    constructor(sort?: string, page: number = 1, pageSize: number = 15) {
        super(sort);
        this.page = page;
        this.pageSize = pageSize;
    }
}