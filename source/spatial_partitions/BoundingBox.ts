// Represents an axis-aligned bounding box.
export default class BoundingBox
{
    // Creates a new box from the specified extents.
    static from_extents
    (   left:   number, right: number,
        bottom: number, top:   number): BoundingBox
    {
        const box = new BoundingBox();

        box.left   = left;
        box.right  = right;
        box.bottom = bottom;
        box.top    = top;

        return box;
    }
    // Creates a new box from the specified center position and size dimensions.
    static from_center_and_size
    (   center_x: number, center_y: number,
        width:    number, height:   number): BoundingBox
    {
        const box = new BoundingBox();

        const w2 = 0.5 * width;
        const h2 = 0.5 * height;

        box.left   = center_x - w2;
        box.right  = center_x + w2;
        box.bottom = center_y - h2;
        box.top    = center_y + h2;

        return box;
    }
    // Creates a new box from the specified center position and radius.
    static from_center_and_radius
    (   center_x: number,  center_y: number,
        radius:   number): BoundingBox
    {
        const box = new BoundingBox();

        box.left   = center_x - radius;
        box.right  = center_x + radius;
        box.bottom = center_y - radius;
        box.top    = center_y + radius;

        return box;
    }

    // Computes the union of two boxes.
    static union
    (   first:  BoundingBox,
        second: BoundingBox): BoundingBox
    {
        const box = new BoundingBox();

        box.left   = Math.min(first.left,   second.left);
        box.right  = Math.max(first.right,  second.right);
        box.bottom = Math.min(first.bottom, second.bottom);
        box.top    = Math.max(first.top,    second.top);

        return box;
    };
    // Computes the intersection of two boxes.
    static intersection
    (   first:  BoundingBox,
        second: BoundingBox): BoundingBox
    {
        const box = new BoundingBox();

        box.left   = Math.max(first.left,   second.left);
        box.right  = Math.min(first.right,  second.right);
        box.bottom = Math.max(first.bottom, second.bottom);
        box.top    = Math.min(first.top,    second.top);

        return box;
    }

    // The box's left boundary coordinate.
    left: number;
    // The box's right boundary coordinate.
    right: number;
    // The box's bottom boundary coordinate.
    bottom: number;
    // The box's top boundary coordinate.
    top: number;

    // Determines whether this box is degenerate (has zero/negative area).
    is_degenerate(): boolean
    {
        return this.left   >= this.right ||
               this.bottom >= this.top;
    }

    // Determines whether the specified box overlaps this one.
    overlaps(other: BoundingBox): boolean
    {
        return other.left   <= this.right  &&
               other.right  >= this.left   &&
               other.bottom <= this.top    &&
               other.top    >= this.bottom;
    }
    // Determines whether the specified box is fully contained within this one.
    contains(other: BoundingBox): boolean
    {
        return other.left   >= this.left   &&
               other.right  <= this.right  &&
               other.bottom >= this.bottom &&
               other.top    <= this.top;
    }
}
