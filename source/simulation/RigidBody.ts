import Vector from "../linear_algebra/Vector";


// Represents a rigid body.
export default class RigidBody
{
    // Creates a new body with the specified mass.
    constructor(mass: number, elasticity: number = 1)
    {
        if (mass <= 0)
        {
            throw new Error("Rigid bodies cannot have a non-positive mass.");
        }
        if (elasticity < 0)
        {
            throw new Error("Rigid bodies cannot have negative elasticity.");
        }

        this.mass         = mass;
        this.mass_inverse = 1 / mass;

        this.elasticity = elasticity;
    }

    // This body's mass.
    readonly mass: number;
    // This body's mass inverse (1 / mass).
    readonly mass_inverse: number;

    // This body's elasticity coefficient in [0 = inelastic, 1 = elastic].
    readonly elasticity: number;

    // This body's position vector.
    position: Vector = Vector.zero();
    // This body's rotation angle.
    rotation: number = 0.0;

    // This body's velocity vector.
    velocity: Vector = Vector.zero();
    // This body's angular velocity.
    angular_velocity: number = 0.0;

    // Computes this body's linear momentum.
    momentum(): Vector
    {
        return Vector.scale(this.velocity, this.mass);
    }
    // Computes this body's kinetic energy.
    kinetic_energy(): number
    {
        return 0.5 * this.mass * this.velocity.length_squared();
    }
}
