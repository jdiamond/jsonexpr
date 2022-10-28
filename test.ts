import test from "test";
import assert from "assert";

import { evaluateExpression } from "./jsonexpr";

test("evaluateExpression returns primitives", () => {
  assert.strictEqual(evaluateExpression("abc"), "abc");
  assert.strictEqual(evaluateExpression(123), 123);
  assert.strictEqual(evaluateExpression(true), true);
  assert.strictEqual(evaluateExpression(false), false);
  assert.strictEqual(evaluateExpression(null), null);
  assert.strictEqual(evaluateExpression(undefined), undefined);
});

test("evaluateExpression evaluates code in curly braces", () => {
  assert.strictEqual(evaluateExpression("{1 + 2}"), 3);
});

test("expressions can access properties in context", () => {
  assert.deepEqual(evaluateExpression("{this.a + this.b}", { a: 1, b: 2 }), 3);
});

test("when expressions are arrays, evaluates each item", () => {
  assert.deepEqual(evaluateExpression(["abc", 123, "{1 + 2}"]), [
    "abc",
    123,
    3,
  ]);
});

test("when expressions are objects, evaluates each property", () => {
  assert.deepEqual(
    evaluateExpression(
      {
        str: "abc",
        num: 123,
        math: "{1 + 2}",
      },
      {}
    ),
    {
      str: "abc",
      num: 123,
      math: 3,
    }
  );
});

test("nested arrays and objects can also contain expressions", () => {
  assert.deepEqual(
    evaluateExpression(
      {
        str: "abc",
        num: 123,
        math: "{1 + 2}",
        arr: [
          "def",
          456,
          "{3 + 4}",
          {
            str: "ghi",
            num: 789,
            math: "{5 + 6}",
          },
        ],
      },
      {}
    ),
    {
      str: "abc",
      num: 123,
      math: 3,
      arr: [
        "def",
        456,
        7,
        {
          str: "ghi",
          num: 789,
          math: 11,
        },
      ],
    }
  );
});
