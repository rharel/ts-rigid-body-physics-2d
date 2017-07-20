import Vector from "../linear_algebra/Vector";


// Tests if two discs intersect.
//
// c1, r1:
//      The first disc's center and radius.
// c2, r2:
//      The second disc's center and radius.
//
// Returns true iff the discs intersect.
//
export function test_for_intersection
(   c1: Vector, r1: number,
    c2: Vector, r2: number): boolean
{
    return c1.distance_squared_to(c2) <= Math.pow(r1 + r2, 2);
}
