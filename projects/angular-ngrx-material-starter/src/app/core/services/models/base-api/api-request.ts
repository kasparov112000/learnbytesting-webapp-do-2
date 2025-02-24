import { ApiRequestBuilder } from './api-request-builder';
import { ApiQuery } from './api-query';
import { QueryOperator } from './query-operator';

export class ApiRequest {
    public query: Array<ApiQuery> = new Array<ApiQuery>();
    public sort?: string;

    public where<TModel>(expression: (model: TModel) => boolean, parameters?: any): ApiRequest {
        const queries =
            new ApiRequestBuilder()
                .buildQueryFromExpression(expression.toString(), parameters);

        this.updateQueries(queries);
        return this;
    }


    public useQuery(name: string, value: any, queryOperator: QueryOperator) {
        const apiQuery = new ApiQuery({
            name,
            value,
            apiQueryOperator: ApiRequestBuilder.getByQueryOperator(queryOperator),
        });

        this.updateQueries([apiQuery]);
        return this;
    }
    
    // TODO: This will become a builder as well soon...  ie: request.orderBy(x => x.name)
    public orderBy(sort: string): ApiRequest {
        this.sort = sort;
        return this;
    }

    public clear(propertyName?: string): void {
        if (propertyName) {
            const index = this.query.map(q => q.name).indexOf(propertyName);
            if (index > -1) {
                this.query.splice(index, 1);
            }
        } else {
            this.query = new Array<ApiQuery>();
        }
    }

    private updateQueries(queries: Array<ApiQuery>): void {
        for (let newQuery of queries) {
            const existingQuery = this.query.find((apiQuery) => apiQuery.name === newQuery.name);
            if (existingQuery) {
                existingQuery.apiQueryOperator = newQuery.apiQueryOperator;
                existingQuery.value = newQuery.value;
            } else {
                this.query.push(newQuery);
            }
        }
    }
}
