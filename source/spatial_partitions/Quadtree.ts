import Entity from "../simulation/Entity";
import Indexable from "../common/Indexable";

import BoundingBox from "./BoundingBox";


// A data-structure representing a recursive partition of space into four quadrants.
export default class Quadtree
{
    // Creates a new tree with the specified depth and covering the specified region.
    //
    // depth:
    //      The desired depth.
    // bounds:
    //      The spatial bounds to partition.
    //
    constructor
    (   depth:   number,
        bounds:  BoundingBox,
        is_root: boolean = true)
    {
        if (depth < 1) { depth = 1; }

        this.depth   = depth;
        this.is_leaf = depth === 1;

        this.bounds = bounds;

        const w2 = 0.5 * (bounds.right - bounds.left),
              h2 = 0.5 * (bounds.top   - bounds.bottom);

        this.center =
        {
            x: bounds.left   + w2,
            y: bounds.bottom + h2
        };

        this.is_root = is_root;

        if (!this.is_leaf)
        {
            const child_depth = depth - 1;

            const {x, y} = this.center;
            const w4 = 0.5 * w2,
                  h4 = 0.5 * h2;
            const box = BoundingBox.from_center_and_size;

            this._children =
            [   new Quadtree(child_depth, box(x - w4,  y - h4,  w2, h2), false),  // SW
                new Quadtree(child_depth, box(x + w4,  y - h4,  w2, h2), false),  // SE
                new Quadtree(child_depth, box(x - w4,  y + h4,  w2, h2), false),  // NW
                new Quadtree(child_depth, box(x + w4,  y + h4,  w2, h2), false)   // NE
            ];
        }
        else
        {
            this._population = new Array<Entity>(2);
        }
    }

    // This node's depth.
    readonly depth: number;
    // Indicates whether this node is a leaf.
    readonly is_leaf: boolean;
    // Indicates whether this node is the root.
    readonly is_root: boolean;

    // This node's bounds.
    readonly bounds: BoundingBox;
    // This node's bounds' center.
    readonly center:
    {
        readonly x: number,
        readonly y: number
    };

    // Indicates whether this node contains any entities.
    get is_empty(): boolean { return this._population_count === 0; }
    // Indicates how many entities are contained in this node.
    get population_count(): number { return this._population_count; }
    // Gets this node's entities (only applicable to leaves).
    get population(): Indexable<Entity> { return this._population; }

    // Clears the structure of all entities.
    clear()
    {
        if (!this.is_root) { throw new Error("Only a root node may clear()."); }

        this._clear();
    }
    // Adds the specified entity to the structure.
    //
    // Returns true iff the entity's bounding box overlaps the bounds of this node and therefore
    // was added successfully.
    //
    add(entity: Entity, region?: BoundingBox): boolean
    {
        if (!this.is_root) { throw new Error("Only a root node may add()."); }

        if (region === undefined)
        {
            const p = entity.body.position;
            region = BoundingBox.from_center_and_radius(p.x, p.y, entity.geometry.radius);
        }
        if (region.overlaps(this.bounds))
        {
            this._associate(entity, region);
            return true;
        }
        else { return false; }
    }
    // Removes the specified entity from the structure.
    //
    // Returns true iff the entity's bounding box overlaps the bounds of this node and therefore
    // was removed successfully.
    //
    remove(entity: Entity, region?: BoundingBox): boolean
    {
        if (!this.is_root) { throw new Error("Only a root node may remove()."); }

        if (region === undefined)
        {
            const p = entity.body.position;
            region = BoundingBox.from_center_and_radius(p.x, p.y, entity.geometry.radius);
        }
        if (region.overlaps(this.bounds))
        {
            this._disassociate(entity, region);
            return true;
        }
        else { return false; }
    }
    // Updates the region associated with the specified entity.
    //
    // Returns true iff the entity's bounding box overlaps the bounds of this node.
    //
    move
    (   entity: Entity,
        previous_region: BoundingBox,
        current_region?: BoundingBox): boolean
    {
        if (!this.is_root) { throw new Error("Only a root node may move()."); }

        if (current_region === undefined)
        {
            const p = entity.body.position;
            current_region = BoundingBox.from_center_and_radius(p.x, p.y, entity.geometry.radius);
        }

        if (current_region.overlaps(this.bounds))
        {
            const intersection = BoundingBox.intersection(previous_region, current_region);
            if (intersection.is_degenerate())
            {
                this._disassociate(entity, previous_region);
                this._associate(entity, current_region);
            }
            else
            {
                const union = BoundingBox.union(previous_region, current_region);
                this._move
                (   entity,
                    previous_region, current_region,
                    union, intersection
                );
            }
            return true;
        }
        else
        {
            this._disassociate(entity, previous_region);
            return false;
        }
    }

    // Invokes a callback for each of this node's children.
    for_each_child(callback: (node: Quadtree) => void)
    {
        this._children.forEach(callback);
    }
    // Invokes a callback for each of this node's leaves.
    for_each_leaf(callback: (node: Quadtree) => void)
    {
        if (this.is_leaf) { callback(this); }
        else
        {
            this._children.forEach(child =>
            {
                child.for_each_leaf(callback);
            });
        }
    }
    // Invokes a callback for each of this node's leaves which are not empty.
    for_each_non_empty_leaf(callback: (node: Quadtree) => void)
    {
        this.for_each_leaf_with_at_least(1, callback);
    }
    // Invokes a callback for each of this node's leaves which contain at least a specified number
    // of entities.
    for_each_leaf_with_at_least
    (   threshold: number,
        callback: (node: Quadtree) => void)
    {
        if (this._population_count < threshold) { return; }
        else if (this.is_leaf) { callback(this); }
        else
        {
            this._children.forEach(child =>
            {
                child.for_each_leaf_with_at_least(threshold, callback);
            });
        }
    }
    // Invokes a callback for each entity of this node (only applicable for leaves).
    for_each_entity(callback: (entity: Entity) => void)
    {
        if (this.is_leaf) { this._population.forEach(callback); }
    }

    private _clear()
    {
        if (this._population_count === 0)
        {
            return;
        }
        else if (!this.is_leaf)
        {
            this._children.forEach(child =>
            {
                child._clear();
            });
        }
        this._population_count = 0;
    }

    private _associate(entity: Entity, region: BoundingBox): number
    {
        if (!this.is_leaf)
        {
            let n = 0;
            this._for_each_overlapping_child(region, child =>
            {
                n = n + child._associate(entity, region);
            });
            this._population_count = this._population_count + n;

            return n;
        }
        let i: number;
        if ((i = this._population.indexOf(entity)) === -1 ||
             i >= this._population_count)
        {
            this._add(entity);

            return 1;
        }
        else
        {
            return 0;
        }
    }
    private _disassociate(entity: Entity, region: BoundingBox): number
    {
        if (!this.is_leaf)
        {
            let n = 0;
            this._for_each_overlapping_child(region, child =>
            {
                n = n + child._disassociate(entity, region);
            });
            this._population_count = this._population_count + n;

            return n;
        }
        let i: number;
        if ((i = this._population.indexOf(entity)) !== -1 &&
             i < this._population_count)
        {
            this._remove(i);

            return -1;
        }
        else
        {
            return 0;
        }
    }
    private _move
    (   entity: Entity,
        previous_region: BoundingBox,
        current_region:  BoundingBox,
        union:           BoundingBox,
        intersection:    BoundingBox): number
    {
        if (!this.is_leaf)
        {
            if (intersection.contains(this.bounds)) { return 0; }

            let n = 0;
            this._for_each_overlapping_child(union, child =>
            {
                n = n + child._move
                    (   entity,
                        previous_region, current_region,
                        union, intersection
                    );
            });
            this._population_count = this._population_count + n;

            return n;
        }

        if (this.bounds.contains(union)) { return 0; }

        const overlaps_previous = previous_region.overlaps(this.bounds),
              overlaps_current  = current_region.overlaps(this.bounds);

        if (overlaps_previous && overlaps_current) { return 0; }

        let i: number;
        if (overlaps_previous)
        {
            if ((i = this._population.indexOf(entity)) !== -1 &&
                 i < this._population_count)  { this._remove(i);  return -1; }
        }
        if (overlaps_current)
        {
            if ((i  = this._population.indexOf(entity)) === -1 ||
                 i >= this._population_count) { this._add(entity); return 1; }
        }
        return 0;
    }

    // (assumes this is a leaf)
    private _add(entity: Entity)
    {
        if (this._population_count < this._population.length)
        {
            this._population[this._population_count] = entity;
        }
        else
        {
            this._population.push(entity);
        }
        ++ this._population_count;
    }
    // (assumes this is a leaf)
    private _remove(index: number)
    {
        if (index < this._population_count - 1)
        {
            this._population.splice(index, 1);
        }
        -- this._population_count;
    }

    // (assumes this is an internal)
    private _for_each_overlapping_child
    (   region:    BoundingBox,
        callback: (child: Quadtree) => void)
    {
        const {left, right, bottom, top} = region;
        const {x, y} = this.center;
        const child  = this._children;

        if (left <= x)
        {
            if (bottom <= y) { callback(child[Quadtree.SW]); }
            if (top    >= y) { callback(child[Quadtree.NW]); }
        }
        if (right >= x)
        {
            if (bottom <= y) { callback(child[Quadtree.SE]); }
            if (top    >= y) { callback(child[Quadtree.NE]); }
        }
    }

    private readonly _population: Array<Entity>;
    private _population_count:    number = 0;

    private readonly _children: [ Quadtree, Quadtree,
                                  Quadtree, Quadtree ];

    // Indices of individual quadrants in the children array.
    private static readonly SW = 0;
    private static readonly SE = 1;
    private static readonly NW = 2;
    private static readonly NE = 3;
}
