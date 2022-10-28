// Aliases like this aren't enforced but it's nice documentation.
type DynamicExpression = string;

type CompiledExpression = () => unknown;

function isDynamicExpression(expr: unknown): expr is DynamicExpression {
  return typeof expr === "string" && expr.startsWith("{") && expr.endsWith("}");
}

const cache = new Map<DynamicExpression, CompiledExpression>();

function getCompiledExpression(expr: DynamicExpression): CompiledExpression {
  let fn = cache.get(expr);

  if (!fn) {
    fn = new Function(`return (${expr.slice(1, -1)});`) as CompiledExpression;

    cache.set(expr, fn);
  }

  return fn;
}

export function evaluateExpression(expr: unknown, ctx?: unknown): unknown {
  if (expr == null) {
    return expr;
  } else if (isDynamicExpression(expr)) {
    return getCompiledExpression(expr).call(ctx);
  } else if (Array.isArray(expr)) {
    return expr.map((value) => evaluateExpression(value, ctx));
  } else if (typeof expr === "object") {
    return Object.fromEntries(
      Object.entries(expr).map(([key, value]) => [
        key,
        evaluateExpression(value, ctx),
      ])
    );
  } else {
    return expr;
  }
}
