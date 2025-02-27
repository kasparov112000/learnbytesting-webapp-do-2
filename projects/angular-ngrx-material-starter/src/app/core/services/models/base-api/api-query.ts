import { ApiQueryOperator } from './api-query-operator';

export class ApiQuery {
    public name: string;
    public value: string;
    public apiQueryOperator?: ApiQueryOperator;
    
    constructor(init?: { name?: string, value?: string, apiQueryOperator?: ApiQueryOperator}) {
        if(init) {
            Object.assign(this, init);
        }
    }
}
