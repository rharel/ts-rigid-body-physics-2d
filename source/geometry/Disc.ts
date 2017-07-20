import Vector from "../linear_algebra/Vector";


// Represents a rectangular geometry.
export default class Disc
{
    // Creates a new disc geometry with the specified radius.
    constructor(radius: number)
    {
        this.radius         = radius;
        this.center_of_mass = Vector.uniform(radius);
    }

    // This geometry's horizontal extent.
    readonly radius: number;

    // This geometry's center of mass.
    readonly center_of_mass: Vector;

    // This geometry's moment of inertia for a body of the specified mass.
    moment_of_inertia(mass: number): number
    {
        const r2 = Math.pow(this.radius, 2);

        return 0.5 * mass * r2;
    }
}
