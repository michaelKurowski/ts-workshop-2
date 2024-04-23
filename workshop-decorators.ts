import * as express  from 'express';

/**
 * BASIC DECORATORS
 * Decorators from version 5.0 of TS
 */

function loggedMethod(originalMethod: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name);

  function replacementMethod(this: any, ...args: any[]) {
      console.log(`CTX`, context)
      console.log(`LOG: Entering method '${methodName}'.`)
      const result = originalMethod.call(this, ...args);
      console.log(`LOG: Exiting method '${methodName}'.`)
      return result;
  }

  return replacementMethod;
}

class Person {
  name: string;
  constructor(name: string) {
      this.name = name;
  }

  @loggedMethod
  greet() {
      console.log(`Hello, my name is ${this.name}.`);
  }
}

const p = new Person("Ron");
p.greet();

// Practical example

type Decorator<T> = (
  value: T, 
  context: { kind: "method", name: string | symbol }
) => T | void;

function Cacheable<T extends (...args: any[]) => any>(): Decorator<T> {
  const cache = new Map();

  return (originalMethod: T, { name }): T => {
    return function(this: any, ...args: any[]): ReturnType<T> {
      const cacheKey = name.toString() + JSON.stringify(args);
      if (cache.has(cacheKey)) {
        console.log(`Cache hit for method: ${name.toString()}`);
        return cache.get(cacheKey);
      }
      console.log(`Cache miss for method: ${name.toString()}, computing result...`);
      const result = originalMethod.apply(this, args);
      cache.set(cacheKey, result);
      return result;
    } as T;
  };
}

class ProductService {
  @Cacheable()
  fetchProductDetails(productId: number): { id: number; name: string; price: number } {
    console.log('Fetching details from the database...');
    return { id: productId, name: "Product " + productId, price: Math.random() * 100 };
  }
}

const productService = new ProductService();
console.log(productService.fetchProductDetails(10));
console.log(productService.fetchProductDetails(10));  // This will hit the cache.


// DECORATORS METADATA TS 5.2

// Not every runtime implements this specific symbol
// polyfil is very simple however
//@ts-expect-error
Symbol.metadata ??= Symbol("Symbol.metadata");

function setMetadata(_target: any, context: ClassFieldDecoratorContext | ClassMethodDecoratorContext | ClassAccessorDecoratorContext) {

  context.metadata[context.name] = true;
}
class SomeClass {
  @setMetadata
  foo = 123;
  @setMetadata
  accessor bar = "hello!";
  @setMetadata
  baz() { }
}
const ourMetadata = SomeClass[Symbol.metadata];
console.log('ourMetadata', JSON.stringify(ourMetadata));

// practical example
const app = express();

function get(_target: any, context: ClassFieldDecoratorContext | ClassMethodDecoratorContext | ClassAccessorDecoratorContext) {

  context.metadata[context.name] = true;
  app.get('/' + (context.name as string), _target)
}




class MyController {
  @get
  getProducts(req, res) {
    res.send('products')
   }
}

// class MyController {
//   @get
//   getProducts(req: any, res: any) {
//     res.send('Products');
//   }
// }

// new MyController();

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

app.get('/help', (req, res) => {
  res.send(JSON.stringify(MyController[Symbol.metadata]));
})