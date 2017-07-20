// Solves the quadratic equation ax^2 + bx + c = 0.
//
// a, b, c:
//      The equation's coefficients.
// output:
//      The output buffer.
//
// Returns the solution count (0-2).
//
export function solve
(   a: number,
    b: number,
    c: number,
    output: [number, number]): number
{
    const b2_4ac = b*b - 4*a*c;

    if (b2_4ac < 0)
    {
        return 0;
    }
    else if (b2_4ac > 0)
    {
        const sqrt_b2_4ac = Math.sqrt(b2_4ac);
        const _2a         = 2 * a;

        output[0] = (-b + sqrt_b2_4ac) / _2a;
        output[1] = (-b - sqrt_b2_4ac) / _2a;

        return 2;
    }
    else  // b2_4ac == 0
    {
        output[0] = -b / (2*a);

        return 1;
    }
}
