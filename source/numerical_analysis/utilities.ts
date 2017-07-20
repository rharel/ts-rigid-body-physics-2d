// Determines which number is the maximum and which is the minimum of a pair.
//
// a:
//      The first number.
// b:
//      The second number.
//
// Returns an array [min(a, b), max(a, b)].
//
export function minmax(a: number, b: number): [number, number]
{
    if (a <= b) { return [a, b]; }
    else        { return [b, a]; }
}
