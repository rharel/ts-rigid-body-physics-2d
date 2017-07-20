import Vector from "../../linear_algebra/Vector";


// Computes and applies the elastic collision response for two discs.
//
// x1, u1, m1, e1:
//      The first disc's position, velocity, mass, and elasticity.
// x2, u2, m2, e2:
//      The second disc's position, velocity, mass, and elasticity.
// target:
//      The entity/entities to apply the response to.
// [distance]:
//      The distance to assume there is between x1 and x2.
//
export function apply_collision_response
(   x1: Vector, u1: Vector, m1: number, e1: number,
    x2: Vector, u2: Vector, m2: number, e2: number,
    target:    Target,
    distance?: number)
{
    const dx = Vector.subtract(x1, x2);
    const du = Vector.subtract(u1, u2);

    if (distance !== undefined) { dx.set_length(distance); }

    const COR = 0.5 * (e1 + e2);  // coefficient of restitution
    const C   = COR * 2 * du.dot(dx) / ((m1 + m2) * dx.length_squared());

    switch (target)
    {
        case Target.First:
        {
            u1.subtract(dx.scale(C * m2)); return;
        }
        case Target.Second:
        {
            u2.subtract(dx.scale(-C * m1)); return;
        }
        default:  // Target.Both
        {
            u1.subtract(Vector.scale(dx,  C * m2));
            u2.subtract(Vector.scale(dx, -C * m1));

            return;
        }
    }
}

// Separates two discs from each other until the distance between them is at least as large as the
// specified threshold.
//
// c1, r1:
//      The first disc's center and radius.
// c2, r2:
//      The second disc's center and radius.
// padding:
//      The minimum distance to leave between the two discs.
// target:
//      The entity/entities to move.
//
export function separate
(   c1: Vector, r1: number,
    c2: Vector, r2: number,
    padding: number,
    target:  Target)
{
    const R  = r1 + r2 + padding;
    const D2 = c1.distance_squared_to(c2);

    if (D2 >= Math.pow(R, 2)) { return; }
    else
    {
        // Collision axis:
        const u = Vector.subtract(c1, c2).normalize();

        // The offset by which to move each body along the collision axis:
        let h = R - Math.sqrt(D2);

        switch (target)
        {
            case Target.First:
            {
                c1.add(u.scale(h)); return;
            }
            case Target.Second:
            {
                c2.add(u.scale(-h)); return;
            }
            default:  // Target.Both
            {
                h = h * 0.5;

                c1.add(Vector.scale(u,  h));
                c2.add(Vector.scale(u, -h));

                return;
            }
        }
    }
}
// Enumerates possible non-empty subsets of a pair.
export enum Target
{
    First = 0,
    Second = 1,
    Both = 2
}
