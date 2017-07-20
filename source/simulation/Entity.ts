import Disc from "../geometry/Disc";
import Vector from "../linear_algebra/Vector";

import RigidBody from "./RigidBody";


// Represents a two-dimensional physical entity.
export default class Entity
{
    // Creates a new entity made up of the specified body and geometry.
    constructor(body: RigidBody, geometry: Disc)
    {
        this.body     = body;
        this.geometry = geometry;

        this.moment_of_inertia         = geometry.moment_of_inertia(body.mass);
        this.moment_of_inertia_inverse = 1 / this.moment_of_inertia;
    }

    // The rigid body representing this entity's physical properties.
    readonly body: RigidBody;
    // The geometry representing this entity's shape.
    readonly geometry: Disc;

    // This entity's moment of inertia.
    readonly moment_of_inertia: number;
    // This entity's moment of inertia inverse (1 / I).
    readonly moment_of_inertia_inverse: number;

    // Indicates whether this entity's position and rotation are fixed.
    is_static: boolean = false;

    // The linear force being applied to this entity.
    applied_force: Vector = Vector.zero();
    // The rotational force being applied to this entity.
    applied_torque: number = 0;
}
