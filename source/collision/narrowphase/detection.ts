import Entity from "../../simulation/Entity";
import Indexable from "../../common/Indexable";
import Vector from "../../linear_algebra/Vector";

import {minmax} from "../../numerical_analysis/utilities";
import {solve as solve_quadratic_equation} from "../../numerical_analysis/quadratic";
import {test_for_intersection} from "../../geometry/intersection";


export class CollisionTester
{
    // Tests whether two discs with the specified velocities collide in the near future.
    //
    // c1, v1, r1:
    //      The first disc's center, velocity, and radius.
    // c2, v2, r2:
    //      The second disc's center, velocity, and radius.
    // dt:
    //      The length of time into the future to check for collision.
    //
    // Returns -1 if the discs do not collide in the next dt units of time, or the time of
    // collision if they do.
    //
    static test_for_collision
    (   c1: Vector, v1: Vector, r1: number,
        c2: Vector, v2: Vector, r2: number,
        dt: number): number
    {
        // The squared distance between the two centers at time t is:
        //
        // (1)  D(t) = |(c1 + v1 * t) - (c2 + v2 * t)| ^ 2
        //
        // We are interested in finding whether D(t) <= (r1 + r2) ^ 2 on the interval [0, dt].
        // This is equivalent to solving the following equation:
        //
        // (2)   ((c1.x + v1.x * t) - (c2.x + v2.x * t)) ^ 2 +
        //       ((c1.y + v1.y * t) - (c2.y + v2.y * t)) ^ 2 -
        //       (r1 + r2) ^ 2 <= 0
        //
        // Rewrite:
        //
        //      (c1.x - c2.x + (v1.x - v2.x) * t) ^ 2 +
        //      (c1.y - c2.y + (v1.y - v2.y) * t) ^ 2 -
        //      (r1 + r2) ^ 2 <= 0
        //
        // Denote the components of c1 - c2 = [dc_x, dc_y], those of v1 - v2 [dv_x, dv_y], and call
        // r1 + r2 = R:
        //
        //      (dc_x + dv_x * t) ^ 2 +
        //      (dc_y + dv_y * t) ^ 2 -
        //      R ^ 2 <= 0
        //
        // Rewrite:
        //
        //      dc_x^2 + 2*dc_x*dv_x*t + (dv_x^2)*(t^2) +
        //      dc_y^2 + 2*dc_y*dv_y*t + (dv_y^2)*(t^2) -
        //      R ^ 2 <= 0
        //
        // Which can be expressed as:
        //
        //      a*(t^2) + b*t + c <= 0
        //
        // Where:
        //
        //      a = dv_x^2 + dv_y^2
        //      b = 2 * (dc_x*dv_x + dc_y*dv_y)
        //      c = dc_x^2 + dc_y^2 - R^2
        //
        // Solving this yields at most two solutions. All we have to do next is take the minimum
        // of the two that is also contained within the interval [0, dt].
        //

        const dv_x = v1.x - v2.x;
        const dv_y = v1.y - v2.y;

        const dv_x2 = dv_x * dv_x;
        const dv_y2 = dv_y * dv_y;

        const dc_x = c1.x - c2.x;
        const dc_y = c1.y - c2.y;

        const dc_x2 = dc_x * dc_x;
        const dc_y2 = dc_y * dc_y;

        const solution       = CollisionTester._quadratic_solution;
        const solution_count =
            solve_quadratic_equation
            (   dv_x2 + dv_y2,
                2   *   (dc_x * dv_x   +   dc_y * dv_y),
                dc_x2 + dc_y2 - Math.pow(r1 + r2, 2),
                solution
            );

        let t: number;
        if (solution_count === 2)
        {
            const [t1, t2] = minmax(solution[0], solution[1]);

            t = t1;
            if (t1 < 0 && t2 >= 0) { return 0; }
        }
        else if (solution_count === 0)
        {
            return -1;
        }
        else  // solution_count === 1
        {
            t = solution[0];
        }
        if (0 <= t && t <= dt) { return t; }
        else                   { return -1; }
    }
    private static _quadratic_solution: [number, number] = [0, 0];
}

// Finds near-future colliding pairs for a set of discs.
//
// entities:
//      An indexable of entities.
// entity_count:
//      The number of items in the entities indexable.
// dt:
//      The length of time into the future to check for collision.
//
// out_indices:
//      A buffer that will hold the indices of entities who are part of a collision pair.
// out_pair_indices, out_pair_collision_times:
//      Pairs an entity's index with both the index of its colliding partner and the time of
//      collision if it indeed collides, otherwise maps it to -1.
//
// Returns the number of colliding pairs detected.
//
export function find_colliding_pairs
(   entities:     Indexable<Entity>,
    entity_count: number,

    dt: number,

    out_indices:              Array<number>,
    out_pair_indices:         Array<number>,
    out_pair_collision_times: Array<number>): number
{
    let i: number = 0,
        j: number,
        k: number;
    let t: number;
    let a: Entity,
        b: Entity;
    let a_is_static:       boolean,
        a_body_position:   Vector,
        a_body_velocity:   Vector,
        a_geometry_radius: number;

    const test_for_collision = CollisionTester.test_for_collision;

    for (j = 0; j < entity_count; ++j) { out_pair_indices[j] = -1; }
    for (j = 0; j < entity_count; ++j)
    {
        a                 = entities[j];
        a_is_static       = a.is_static;
        a_body_position   = a.body.position;
        a_body_velocity   = a.body.velocity;
        a_geometry_radius = a.geometry.radius;

        for (k = j + 1; k < entity_count; ++k)
        {
            b = entities[k];

            if (a_is_static && b.is_static) { continue; }

            t = test_for_collision
            (   a_body_position, a_body_velocity, a_geometry_radius,
                b.body.position, b.body.velocity, b.geometry.radius,
                dt
            );
            if (t !== -1)
            {
                out_pair_indices[j] = k;
                out_pair_indices[k] = j;

                out_pair_collision_times[j] = t;

                out_indices[i] = j;

                ++i;
            }
        }
    }
    return i;
}
// Finds intersecting pairs for a set of discs.
//
// entities:
//      An indexable of entities.
// entity_count:
//      The number of items in the entities indexable.
//
// out_indices:
//      A buffer that will hold the indices of entities who are part of an intersecting pair.
// out_pairs:
//      Pairs an entity's index with the index of its intersecting partner if it exists, otherwise
//      maps it to -1.
//
// Returns the number of intersecting pairs detected.
//
export function find_intersecting_pairs
(   entities:     Indexable<Entity>,
    entity_count: number,

    out_indices: Array<number>,
    out_pairs:   Array<number>): number
{
    let i: number = 0,
        j: number,
        k: number;
    let a: Entity,
        b: Entity;
    let a_is_static:       boolean,
        a_body_position:   Vector,
        a_geometry_radius: number;

    for (j = 0; j < entity_count; ++j) { out_pairs[j] = -1; }
    for (j = 0; j < entity_count; ++j)
    {
        if (out_pairs[j] !== -1) { continue; }

        a                 = entities[j];
        a_is_static       = a.is_static;
        a_body_position   = a.body.position;
        a_geometry_radius = a.geometry.radius;

        for (k = j + 1; k < entity_count; ++k)
        {
            b = entities[k];

            if (a_is_static && b.is_static) { continue; }

            if (test_for_intersection
                (   a_body_position, a_geometry_radius,
                    b.body.position, b.geometry.radius,
                ))
            {
                out_pairs[j] = k;
                out_pairs[k] = j;

                out_indices[i] = j;

                ++i;

                break;
            }
        }
    }
    return i;
}
