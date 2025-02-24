import { ApiQueryOperator } from './api-query-operator';
import { QueryOperator } from './query-operator';
import { ApiQuery } from './api-query';

export class ApiRequestBuilder {
    /**
     * Gets the regular expression used to parse the lambda expression. ie:  x => x.firstName === vale.firstName
     */
    private expressionRegExp = new RegExp(/(.+[^=!><])(!={1,3}|<=|>=|>|<|={1,3})\s*(.+);\s*\}/);
    private expressions: string[] = new Array<string>();

    public static readonly operators: ApiQueryOperator[] = [
        new ApiQueryOperator(QueryOperator.equals, '=', ['==', '===']),
        new ApiQueryOperator(QueryOperator.exists, 'exists', ['exists()']), // TODO: Make API support methods like  foo.field.exists()
        new ApiQueryOperator(QueryOperator.notEquals, '!=', ['!=', '!==']),
        new ApiQueryOperator(QueryOperator.in, '=', []),
        new ApiQueryOperator(QueryOperator.notIn, '!=', []),
        new ApiQueryOperator(QueryOperator.greaterThan, '>', ['>']),
        new ApiQueryOperator(QueryOperator.lessThan, '<', ['<']),
        new ApiQueryOperator(QueryOperator.greaterThanEqualTo, '>=', ['>=']),
        new ApiQueryOperator(QueryOperator.lessThanEqualTo, '<=', ['<=']),
    ];

    public readonly predicates = {
        or: '||',
        and: '&&',
        lambda: 'return ',
    };


    private query: ApiQuery[] = new Array<ApiQuery>();

    /**
     * Returns an array of ApiQuery objects from the given expression and parameters.
     * @param expression - string representation of the expression to build the query for.
     * @param parameters - object with properties representing the parameters in the expression.
     */
    public buildQueryFromExpression(expression: string, parameters?: []): ApiQuery[] {
        console.log('this.expressions: before prepareexpression method', this.expressions);
        this.expressions = this.prepareExpression(expression.toString());
        console.log('this.expressions: after prepareexpresion method ', this.expressions);
        console.log('parameters: ', parameters);

        this.buildQueryPredicate(parameters);
        return this.query;
    }

    public static getOperator(value: string): ApiQueryOperator {
        return ApiRequestBuilder.operators
            .find((operator) => !!operator.matches.find((match) => value === match));
    }

    public static getByQueryOperator(value: QueryOperator): ApiQueryOperator {
        return ApiRequestBuilder.operators
            .find((operator) => operator.name === value);
    }

    private prepareExpression(expression: string): string[] {
        console.log('r: before prepareExpression', expression);

        if (expression.includes(this.predicates.or)) {
            //  Implement reading operators to support and, or, etc.
            throw new Error(`The operator ${this.predicates.or} (or) is not yet supported. Use && or write a custom query in the microservice.`)
        }

        expression = expression.slice(expression.indexOf(this.predicates.lambda) + 6);
        const r = expression.split(this.predicates.and);
        console.log('r: after prepareExpression', r);
        return r;
    }

    private buildQueryPredicate(parameters?: []): void {
        console.log('parameters: ', parameters);
        console.log('this.expressions', this.expressions);

        if (!this.expressions) {
            throw new Error('No expressions were found to build predicates from.');
        }

        for (const predicate of this.expressions) {
            // const predicateMatch = this.expressionRegExp.exec(predicate);
            const predicateMatch = predicate.split(' ');

                console.log('this.expressionRegExp: ', this.expressionRegExp);
                console.log('this.expressions', this.expressions);
                console.log('pedicatematch', predicateMatch);
                console.log('predicatematchlength', predicateMatch.length);

            if (!predicateMatch || predicateMatch.length < 3) {
                console.error('this.expressions', this.expressions);
                console.error('pedicatematch', predicateMatch);
                console.error('predicatematchlength', predicateMatch.length);


                throw new Error(`Error in specified expression on: ${predicate}`);
            }

            const filteredPredicateMatch = predicateMatch.filter(e => {return e !== '>' });
            const name = this.parsePropertyName(filteredPredicateMatch[0]);
            const apiQueryOperator = this.parseOperator(filteredPredicateMatch[1]);
            const parameterName = this.parsePropertyName(filteredPredicateMatch[2]);
            const value = this.checkValueType(parameters, parameterName);

            if (value) {
                const query = new ApiQuery({
                    name,
                    value,
                    apiQueryOperator
                });
                this.query.push(query);
            }
        }
    }

    private checkValueType(parameters: [], parameterName: string): string {
        let value;

        if (parameterName.includes('.')) {
            const values = parameterName.split('.');

            let recursionValue = parameters;
            for (const propertyName of values) {
                recursionValue = recursionValue[propertyName];
            }
            value = recursionValue;
        } else {
            value = parameters[parameterName];
        }

        if (value instanceof Date) {
            return (value).toLocaleString();
        }
        return value;
    }

    private parseOperator(providedOperator: string): ApiQueryOperator {
        const matchedOperator = ApiRequestBuilder.getOperator(providedOperator);

        if (!matchedOperator) {
            throw new Error(`The Operator provided '${providedOperator}' is invalid or not supported.`);
        }

        return matchedOperator;
    }

    private parsePropertyName(value: string): string {
        return value.slice(value.indexOf('.') + 1).trim();
    }
}
