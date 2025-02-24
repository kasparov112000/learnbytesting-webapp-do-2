import { ApiRequest } from './api-request';

export class SortedApiRequest extends ApiRequest {
    public override sort: string | undefined = undefined;

    constructor(sort?: string) {
        super();
        this.sort = sort;
    }

    // TODO: Make sort array so it supports multiple sorts (serverside already does)
    /**
     * Sets the sort of the ApiRequested with the specified property and direction.
     * Default direction is Ascending if none is provided.
     * Sending an undefined or null property will also clear the current sort.
     */
    public setSort(property?: string, direction?: string) {
        if (!direction) {
            this.sort = void 0;
        } else if (direction === 'desc') {
            this.sort = `-${property}`;
        }
        else {
            this.sort = property;
        }
    }
}
