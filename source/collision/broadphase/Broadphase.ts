import Entity from "../../simulation/Entity";
import Indexable from "../../common/Indexable";
import Vector from "../../linear_algebra/Vector";


// Represents a collision culling operation.
interface Broadphase
{
    // Clears all entities.
    clear(): void;

    // Includes the specified entity.
    add(entity: Entity): void;
    // Excludes the specified entity.
    remove(entity: Entity): void;

    // Signals that the specified entity has moved.
    update(entity: Entity, previous_position: Vector): void;

    // Invokes a callback for each group of entities detected to potentially contain collisions in
    // the near future. The callback receives an indexable and its size.
    for_each_potential_collision_group
    (   callback: (group: Indexable<Entity>, size: number) => void): void;
}
export default Broadphase;
