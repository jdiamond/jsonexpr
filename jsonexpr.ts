// Aliases like this aren't enforced but it's nice documentation.
type DynamicExpression = string;

type CompiledExpression = (...args: unknown[]) => unknown;

function isDynamicExpression(expr: unknown): expr is DynamicExpression {
  return typeof expr === "string" && expr.startsWith("{") && expr.endsWith("}");
}

const cache = new Map<DynamicExpression, CompiledExpression>();

function getCompiledExpression(
  expr: DynamicExpression,
  params: string[]
): CompiledExpression {
  const key = `(${params.join(",")}):${expr}`;

  let fn = cache.get(key);

  if (!fn) {
    fn = new Function(
      ...params,
      `return (${expr.slice(1, -1)});`
    ) as CompiledExpression;

    cache.set(key, fn);
  }

  return fn;
}

export function evaluateExpression(
  expr: unknown,
  ctx: unknown = null,
  params: string[] = [],
  args: unknown[] = []
): unknown {
  if (expr == null) {
    return expr;
  } else if (isDynamicExpression(expr)) {
    return getCompiledExpression(expr, params).apply(ctx, args);
  } else if (Array.isArray(expr)) {
    return expr.map((value) => evaluateExpression(value, ctx, params, args));
  } else if (typeof expr === "object") {
    return Object.fromEntries(
      Object.entries(expr).map(([key, value]) => [
        key,
        evaluateExpression(value, ctx, params, args),
      ])
    );
  } else {
    return expr;
  }
}
