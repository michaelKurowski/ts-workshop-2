
// Pretty TS errors plugin


/**
 * Assertion functions
 */
function assertString(value: string | number): asserts value is string {
  if (typeof value !== "string") throw new Error("Not a string")
}

declare const stringOrNumber: string | number;

assertString(stringOrNumber);
stringOrNumber // is string, as otherwise the function would throw an error


/**
 * Exhaustive checks
 */

type Product =
  {type: 'configurable', name: string} |
  {type: 'simple', name: string} |
  {type: 'grouped', name: string} |
  {type: 'bundle', name: string};


function throwUnsupportedOperation(product: never): never {
  throw new Error('Unsupported operation');
}

function orderProduct(product: MyEcommercePlatformProduct) {
  switch(ast.kind) {
    case 'configurable':
      console.log('Configurable product');
      break;
    case 'simple':
      console.log('Simple product');
      break;
    case 'grouped':
      console.log('Grouped product');
      break;
    case 'bundle':
      console.log('Bundle product');
      break;
    default:
      // product satisfies never
      throwUnsupportedOperation(product)
  }
}



// type Product2 = {
//   type: string,
//   name: string

// }

// type astNode = {
//   type: string,
//   name: string

// }

// const astNodeObj: astNode = {type: 'configurable', name: 'Product 1'} as Product2


/**
 * Branded types, aka nominal typing
 * 
 * - basically allows you to create your own type system
 * - TS types are based on value's structure, this one is based on the name of the type
 * - In other words we can type properties of values that aren't reflected in the structure of the value
 * 
 * Libraries:
 * - https://github.com/kourge/ts-brand - a basic implementation
 * - https://github.com/Coder-Spirit/nominal/blob/main/@coderspirit/nominal/README.md more advanced library that builds on top of the concept of nominal typing
 */
type Brand<K, T> = K & { __brand: T };

type USD = Brand<number, 'USD'>;
type EUR = Brand<number, 'EUR'>;
type Currency = USD | EUR

type Kilometers = Brand<number, 'Kilometers'>;
type Meters = Brand<number, 'Meters'>;
type Distance = Kilometers | Meters
function Usd(amount: number): USD {
  return amount as any;
}

function Euro(amount: number): EUR {
  return amount as any;
}

function sumPrices<T extends Currency>(a: T, b: T): T {
  return (a + b) as T;
}


const sumTwoEurosResult = sumPrices(Euro(29), Euro(30)); // pass
const sumIncompatibleCurrenciesResult = sumPrices(Euro(29), Usd(30)); // error





/**
 * RESULT PATTERN
 * 
 * Libraries that implement it:
 * - https://github.com/vultix/ts-results
 * - https://effect.website/ (Implements effects, with result pattern being one of the features)
 */

type Success<Value> = { kind: 'success', value: Value };
type Failure<ErrorType> = { kind: 'failure', error: Error, type: ErrorType };
type Result<Value, ErrorType extends string> = Success<Value> | Failure<ErrorType>;



function myThrowingFunction(c: number | string) {
  if (typeof c === 'string') {
    return {error: 'Incorrect type', message: 'Expected a number'} as const;
  }
  return c;
}

const result = myThrowingFunction('a')
if (typeof result === 'object'  && 'error' in result) {
  result
}

function divide(a: number, b: number): number {
  return a / b;
}


function wrapWithResult<T extends (...args: any) => any>(cb: T) {
  return (...args: Parameters<T>): Result<ReturnType<T>, 'Unhandled exception'> => {
    try {
      return { kind: 'success', value: cb(...args) };
    } catch(err) {
      return { kind: 'failure', error: new Error(err), type: 'Unhandled exception' };
    }
  }
}



function divideWithResult2(a: number, b: number) {
  try {
    return { kind: 'success', value: a / b };
  } catch(err) {
    return { kind: 'failure', error: new Error('Incorrect division operation'), type: 'Incorrect division operation' };
  }
}

const divideWithResult1 = wrapWithResult(divide);
const divideOutput1 = divideWithResult1(10, 2);
if (divideOutput1.kind === 'failure') {
  console.error(divideOutput1.type);
}


const divideOutput2 = divideWithResult2(10, 2);
if (divideOutput2.kind === 'failure') {
  console.error(divideOutput2.error);
}

type GetUserErrors = 'User not found' | 'User not authorized';

let databaseMock = ['admin', 'Joe']

function getUser(username: string, token: string): Result<number, GetUserErrors> {
  if (!databaseMock.includes(username)) {
    return { kind: 'failure', error: new Error('User not found'), type: 'User not found' };
  }

  if (token !== 'secretAuthToken') {
    return { kind: 'failure', error: new Error('User not authorized'), type: 'User not authorized' };
  }

  return { kind: 'success', value: 1 };
}

const user = getUser('admin', 'secret')
if (user.kind === 'failure') {
  switch(user.type) {
    case 'User not found':
      console.error('User not found');
      break;
    case 'User not authorized':
      console.error('User not authorized');
      break;
    default:
      user.type satisfies never
  }
}


/**
 * Check for breaking changes in the contract
 * 
 * libraries:
 * - https://github.com/geoffreytools/ts-spec more granular types testing
 */

interface OldVersionOfTheApp {
  methods: {
    getUser: (username: string, token: string) => number;
    getProducts: (category: string) => string[];

  }
}

interface NewVersionOfTheAppNoBreakingChanges {
  methods: {
    getUser: (username: string, token: string) => number;
    getProducts: (category: string) => string[];
    newMethod: (id: number) => string;
  }
}

interface NewVersionOfTheAppWithBreakingChanges {
  methods: {
    getUser: (username: string, token: string) => number;
    getProducts: (categoryIds: number) => string[];
  }
}

declare const newVersionWithBreakingChanges: NewVersionOfTheAppWithBreakingChanges;
declare const newVersionNoBreakingChanges: NewVersionOfTheAppNoBreakingChanges;
newVersionWithBreakingChanges satisfies OldVersionOfTheApp // error
newVersionNoBreakingChanges satisfies OldVersionOfTheApp // pass




/**
 * Covariance, invariance etc.
 */

// type Consumer<out T> = (x: T) => void;   
// TODO

/**
 * Optional types are kinda bad
 * Rick Hickey - "nil punning"
 */



/**
 * WIP
 * To the edges of the type system
 * - Dafny
 * - Idris
 */



