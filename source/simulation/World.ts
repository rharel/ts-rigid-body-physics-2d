import Disc from "../geometry/Disc";
import Vector from "../linear_algebra/Vector";

import
{   find_colliding_pairs,
    find_intersecting_pairs} from "../collision/narrowphase/detection";
import
{   Target,
    apply_collision_response,
    separate as separate_bodies} from "../collision/narrowphase/resolution";

import Entity from "./Entity";
import RigidBody from "./RigidBody";
import Broadphase from "../collision/broadphase/Broadphase";
import NaiveBroadphase from "../collision/broadphase/NaiveBroadphase";
import Indexable from "../common/Indexable";


// World option object structure.
type Options =
{
    broadphase: Broadphase,
    do_step_piecewise: boolean
};
function default_options(): Options
{
    return {
        broadphase: new NaiveBroadphase(),
        do_step_piecewise: false
    };
}

// Represents a two dimensional physics simulation.
export default class World
{
    // Creates a new world using the specified user options.
    constructor(user_options: Options)
    {
        const options = Object.assign({}, default_options(), user_options);

        this._broadphase        = options.broadphase;
        this._do_step_piecewise = options.do_step_piecewise;
    }

    // Gets the number of spawned entities.
    get entity_count() { return this._entity_set.size; }

    // Indicates whether this world contains the specified entity.
    contains(entity: Entity): boolean
    {
        return this._entity_set.has(entity);
    }
    // Spawns a new entity with the specified mass and radius.
    spawn(mass: number, radius: number, elasticity: number = 1): Entity
    {
        const body   = new RigidBody(mass, elasticity);
        const entity = new Entity(body, new Disc(radius));

        this._entity_set.add(entity);

        return entity;
    }
    // De-spawns an existing entity.
    despawn(entity: Entity)
    {
        if (!this.contains(entity))
        {
            throw new Error("Cannot despawn a non-existent entity.")
        }
        this._entity_set.delete(entity);
    }
    // De-spawns all entities.
    clear()
    {
        this._entity_set.clear();
    }

    // Initializes the simulation. Call this after you are done invoking spawn()/despawn()/clear().
    initialize()
    {
        const n = this._entity_set.size;

        this._entity_array = [];

        this._buffer_A = new Array<number>(n);
        this._buffer_B = new Array<number>(n);
        this._buffer_C = new Array<number>(n);
        this._buffer_D = new Array<number>(n);

        this._broadphase.clear();

        this._entity_set.forEach(entity =>
        {
            this._entity_array.push(entity);
            this._broadphase.add(entity);
        });
    }
    // Advances the simulation in time.
    step(dt: number)
    {
        if (dt <= 0) { return; }

        this._separate_colliding_bodies();

        if (this._do_step_piecewise)
        {
            this._step_piecewise(dt);
        }
        else
        {
            this._step(dt);
        }

        // Detecting particles at rest:
        this._entity_array.forEach(entity =>
        {
            const v = entity.body.velocity;
            if (v.length_squared() < REST_VELOCITY_THRESHOLD)
            {
                v.assign(Vector.ZERO);
            }
        });
    }

    for_each_entity(callback: (entity: Entity) => void)
    {
        this._entity_array.forEach(callback);
    }

    private _separate_colliding_bodies()
    {
        let intersection_count: number;
        const indices: Array<number> = this._buffer_A,
              pairs:   Array<number> = this._buffer_B;
        const dirty_set = this._dirty_entities;

        dirty_set.clear();
        this._broadphase.for_each_potential_collision_group((group, size) =>
        {
            intersection_count = find_intersecting_pairs(group, size, indices, pairs);
            while (intersection_count > 0)
            {
                for (let i = 0; i < intersection_count; ++i)
                {
                    const j = indices[i];
                    const k = pairs[j];

                    const a = group[j];
                    const b = group[k];

                    if (!a.is_static) { dirty_set.set(a, Vector.duplicate(a.body.position)); }
                    if (!b.is_static) { dirty_set.set(b, Vector.duplicate(b.body.position)); }

                    World._separate(a, b);
                    World._collide(a, b);
                }
                intersection_count = find_intersecting_pairs(group, size, indices, pairs);
            }
        });
        dirty_set.forEach((previous_position, entity) =>
        {
            this._broadphase.update(entity, previous_position);
        });
    }

    private _step_piecewise(dt: number)
    {
        const entities = this._entity_array;
        const stepped = this._stepped_entities;
        const dirty_set = this._dirty_entities;
        const broadphase = this._broadphase;

        entities.forEach(entity =>
        {
            dirty_set.set(entity, Vector.duplicate(entity.body.position));
        }) ;
        stepped.clear();
        broadphase.for_each_potential_collision_group((group, size) =>
        {
            for (let i = 0; i < size; ++i) { stepped.add(group[i]); }
            this._step_group(group, size, dt);
        });
        entities.forEach(entity =>
        {
            if (!stepped.has(entity)) { World._step_entity(entity, dt); }
        });
        dirty_set.forEach((previous_position, entity) =>
        {
            broadphase.update(entity, previous_position);
        });
    }
    private _step_group(group: Indexable<Entity>, size: number, dt: number)
    {
        let collision_count: number;
        let t: number,
            t_min: number;
        let j_min = 0,
            k_min = 0;
        const indices:         Array<number> = this._buffer_A,
              pairs:           Array<number> = this._buffer_B,
              collision_times: Array<number> = this._buffer_C;

        t = dt;
        while (t > MIN_TIME_STEP_SIZE)
        {
            collision_count = find_colliding_pairs
            (   group, size, t,
                indices, pairs, collision_times
            );
            t_min = t;
            for (let i = 0; i < collision_count; ++i)
            {
                const j = indices[i];
                const k = pairs[j];
                const collision_time = collision_times[j];

                if (collision_time < t_min)
                {
                    j_min = j;
                    k_min = k;
                    t_min = collision_time;
                }
            }
            for (let i = 0; i < size; ++i)
            {
                World._step_entity(group[i], t_min);
            }
            if (t_min < t)
            {
                World._collide(group[j_min], group[k_min]);
                World._separate(group[j_min], group[k_min]);
            }
            t = t - t_min;
        }
    }

    private _step(dt: number)
    {
        const previous_position = Vector.zero();
        this._entity_array.forEach(entity =>
        {
            if (!entity.is_static)
            {
                previous_position.assign(entity.body.position);
                World._step_entity(entity, dt);
                this._broadphase.update(entity, previous_position);
            }
        });
    }

    private static _step_entity(entity: Entity, dt: number)
    {
        const body = entity.body;
        const half_dt = 0.5 * dt;
        {
            const F     = entity.applied_force,
                  m_inv = body.mass_inverse,
                  c     = body.position,
                  v     = body.velocity;

            const A = half_dt * m_inv;
            c.x += dt * (v.x + A * F.x);
            c.y += dt * (v.y + A * F.y);

            const B = dt * m_inv;
            v.x += B * F.x;
            v.y += B * F.y;
        }
        {
            const adt = entity.applied_torque * entity.moment_of_inertia_inverse * dt;

            body.rotation         += body.angular_velocity * dt + half_dt * adt;
            body.angular_velocity += adt;
        }
    }

    // (assumes at most one of a, b is static)
    private static _separate(a: Entity, b: Entity)
    {
        const target =
            a.is_static ? Target.Second :
            b.is_static ? Target.First :
            Target.Both;
        separate_bodies
        (   a.body.position, a.geometry.radius,
            b.body.position, b.geometry.radius,
            SEPARATION_PADDING, target
        );
    }

    // (assumes at most one of a, b is static)
    private static _collide(a: Entity, b: Entity)
    {
        // Ensure possibly static entity is assigned to a:
        if (b.is_static) { const c = a; a = b; b = c; }

        const a_body = a.body,
              b_body = b.body;
        const R = a.geometry.radius + b.geometry.radius;

        if (a.is_static)
        {
            apply_collision_response
            (   a_body.position, Vector.ZERO,     STATIC_MASS, a_body.elasticity,
                b_body.position, b_body.velocity, b_body.mass, b_body.elasticity,
                Target.Second, R
            );
        }
        else
        {
            apply_collision_response
            (   a_body.position, a_body.velocity, a_body.mass, a_body.elasticity,
                b_body.position, b_body.velocity, b_body.mass, b_body.elasticity,
                Target.Both, R
            );
        }
    }

    private _broadphase: Broadphase;
    private _do_step_piecewise: boolean;

    private _entity_set = new Set<Entity>();
    private _entity_array: Array<Entity>;
    private _dirty_entities = new Map<Entity, Vector>();
    private _stepped_entities = new Set<Entity>();

    private _buffer_A: Array<number>;
    private _buffer_B: Array<number>;
    private _buffer_C: Array<number>;
    private _buffer_D: Array<number>;
}

const STATIC_MASS = Math.pow(10, 14);
const MIN_TIME_STEP_SIZE = 0.001;
const SEPARATION_PADDING = 0.001;
const REST_VELOCITY_THRESHOLD = 0.001;
