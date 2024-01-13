# JSON with Expressions

Simple support for dynamic expressions in JSON.

## Usage

Install:

```sh
npm install @jdiamond/jsonexpr
```

Import:

```js
import { evaluateExpression } from "@jdiamond/jsonexpr";
```

All input _must_ be trusted!

This library does not parse JSON strings. Use `JSON.parse()` or JSON5 or Hjson or whatever.

The `evaluateExpression` function looks like this:

```ts
function evaluateExpression(
  expr: unknown,
  ctx?: unknown,
  params?: string[],
  args?: unknown[]
): unknown;
```

`ctx` can be accessed via the `this` keyword. If you don't need to do that and only want to acess arguments via their parameter names, you can pass in `null` or `undefined` here.

`params` is the array of names the expression uses to access arguments. You can use curly braces to destructure objects just like in normal JavaScript.

`args` are the actual values the expression will read from.

If you are using TypeScript, you probably want to use something like Zod to parse the output for a type-safe result:

```js
import { evaluateExpression } from "@jdiamond/jsonexpr";
import { getStringFromSomewhere, SomeZodSchema } from "./your-job";

const string = getStringFromSomewhere();
const parsed = JSON.parse(string);
const evaled = evaluateExpression(parsed);
const result = SomeZodSchema.parse(result);
```

## Syntax

Dynamic expressions are strings that start with `{` and end with `}`.

```json
{
  "static": "this is a static string",
  "dynamic": "{'this is a ' + 'dynamic'.toUpperCase() + ' string'}"
}
```

This syntax is inspired by JSX except the curly braces have to be inside strings to keep the JSON valid.

Extra whitespace at the start or end of the strings is not supported. Embedding expressions in the middle of a string is also not supported.

## Examples

Simple:

```js
assert.deepEqual(
  evaluateExpression({
    static: "this is a static string",
    dynamic: "{'this is a ' + 'dynamic'.toUpperCase() + ' string'}",
  }),
  {
    static: "this is a static string",
    dynamic: "this is a DYNAMIC string",
  }
);
```

Not supported:

```js
assert.deepEqual(
  evaluateExpression({
    "no-whitespace": " {this is a static string} ",
    "no-embedding": "this is {also a static} string",
  }),
  {
    "no-whitespace": " {this is a static string} ",
    "no-embedding": "this is {also a static} string",
  }
);
```

Template literal:

```js
assert.deepEqual(
  evaluateExpression({
    "template-literal": "{`this is a ${'dynamic'.toUpperCase()} string`}",
  }),
  {
    "template-literal": "this is a DYNAMIC string",
  }
);
```

Nested:

```js
assert.deepEqual(
  evaluateExpression({
    array: ["one", "{1 + 1}", "three"],
    object: {
      foo: "bar",
      baz: "{'quux'.toUpperCase()}",
    },
  }),
  {
    array: ["one", 2, "three"],
    object: {
      foo: "bar",
      baz: "QUUX",
    },
  }
);
```

Complex:

```js
assert.deepEqual(
  evaluateExpression({
    array: "{[1,2,3].map((num) => num + 3)}",
    object: "{Object.fromEntries([['foo', 'bar'], ['baz', 'quux']])}",
  }),
  {
    array: [4, 5, 6],
    object: { foo: "bar", baz: "quux" },
  }
);
```

Context:

```js
assert.deepEqual(
  evaluateExpression(
    {
      result: "{this.a + this.b}",
    },
    {
      a: 1,
      b: 2,
    }
  ),
  {
    result: 3,
  }
);
```

Parameters/arguments:

```js
assert.deepEqual(
  evaluateExpression(
    {
      result: "{input.a + input.b}",
    },
    null,
    ["input"],
    [
      {
        a: 1,
        b: 2,
      },
    ]
  ),
  {
    result: 3,
  }
);
```

Destructued parameters/arguments:

```js
assert.deepEqual(
  evaluateExpression(
    {
      result: "{a + b}",
    },
    null,
    ["{a, b}"],
    [
      {
        a: 1,
        b: 2,
      },
    ]
  ),
  {
    result: 3,
  }
);
```
