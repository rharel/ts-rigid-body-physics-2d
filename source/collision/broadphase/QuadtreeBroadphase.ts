import Entity from "../../simulation/Entity";
import Indexable from "../../common/Indexable";
import Vector from "../../linear_algebra/Vector";

import BoundingBox from "../../spatial_partitions/BoundingBox";
import Quadtree from "../../spatial_partitions/Quadtree";

import Broadphase from "./Broadphase";


// Represents a collision culling operation using a quadtree.
export default class QuadtreeBroadphase
    implements Broadphase
{
    // Creates a new broadphase using a tree of the specified depth and covering the specified
    // bounds.
    //
    constructor(tree: Quadtree)
    {
        if (!tree.is_root || !tree.is_empty)
        {
            throw new Error("The specified tree is not an empty root.");
        }
        this._tree = tree;
    }

    // Clears all entities.
    clear() { this._tree.clear(); }

    // Includes the specified entity.
    add(entity: Entity) { this._tree.add(entity); }
    // Excludes the specified entity.
    remove(entity: Entity) { this._tree.remove(entity); }

    // Signals that the specified entity has moved.
    update(entity: Entity, previous_position: Vector)
    {
        const previous_bounds =
            BoundingBox.from_center_and_radius
            (   previous_position.x,
                previous_position.y,
                entity.geometry.radius
            );
        this._tree.move(entity, previous_bounds);
    }

    // Invokes a callback for each group of entities detected to potentially contain collisions in
    // the near future. The callback receives an indexable and its size.
    //
    // This quadtree-based implementation return groups of entities that share the same leaf node
    // in the tree.
    //
    for_each_potential_collision_group
    (   callback: (group: Indexable<Entity>, size: number) => void)
    {
        this._tree.for_each_leaf_with_at_least(2, node =>
        {
            callback(node.population, node.population_count);
        });
    }

    private readonly _tree: Quadtree;
}
