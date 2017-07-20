import Entity from "../../simulation/Entity";
import Indexable from "../../common/Indexable";

import Broadphase from "./Broadphase";


// Represents a naive collision culling operation, i.e. no culling takes place at all.
export default class NaiveBroadphase
    implements Broadphase
{
    // Clears all entities.
    clear() { this._entities = []; }

    // Includes the specified entity.
    add(entity: Entity) { this._entities.push(entity); }
    // Excludes the specified entity.
    remove(entity: Entity)
    {
        const i = this._entities.indexOf(entity);
        this._entities.splice(i, 1);
    }

    // Signals that the specified entity has moved.
    update() { }

    // Invokes a callback for each group of entities detected to potentially contain collisions in
    // the near future. The callback receives an indexable and its size.
    //
    // This naive implementation simply returns all entities.
    //
    for_each_potential_collision_group
    (   callback: (group: Indexable<Entity>, size: number) => void)
    {
        callback(this._entities, this._entities.length);
    }

    private _entities: Array<Entity> = [];
}
