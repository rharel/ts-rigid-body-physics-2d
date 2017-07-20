// Two-dimensional vectors and related operations.
export default class Vector
{
    // Creates a new vector with the specified component values.
    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }

    // The zero vector.
    static readonly ZERO = Vector.zero();

    // Creates a new vector by duplicating another.
    static duplicate(other: Vector)
    {
        return new Vector(other.x, other.y);
    }

    // Creates a new unit vector aligned with the horizontal axis.
    static unit_x(): Vector { return new Vector(1, 0); }
    // Creates a new unit vector aligned with the vertical axis.
    static unit_y(): Vector { return new Vector(0, 1); }

    // Creates a new vector with uniform component values.
    static uniform(value: number): Vector { return new Vector(value, value); }

    // Creates a new uniform vector with component value zero.
    static zero(): Vector { return Vector.uniform(0); }
    // Creates a new uniform vector with component value one.
    static one(): Vector { return Vector.uniform(1); }

    // Computes the negation of a vector.
    static negative(u: Vector): Vector
    {
        return new Vector(-u.x, -u.y);
    }

    // Computes the normalized version of a vector.
    static unit(u: Vector): Vector
    {
        const L = 1 / u.length();
        return new Vector
        (   u.x * L,
            u.y * L
        );
    }

    // Computes the component-wise addition of two vectors.
    static add(u: Vector, v: Vector): Vector
    {
        return new Vector
        (   u.x + v.x,
            u.y + v.y
        );
    }
    // Computes the component-wise subtraction of one vector from another.
    static subtract(u: Vector, v: Vector): Vector
    {
        return new Vector
        (   u.x - v.x,
            u.y - v.y
        );
    }
    // Computes the scalar multiplication of a vector.
    static scale(u: Vector, scalar: number): Vector
    {
        return new Vector
        (   u.x * scalar,
            u.y * scalar
        );
    }

    // Preserves direction but creates a vector with the specified length.
    static with_length(u: Vector, scalar: number): Vector
    {
        const L = scalar / u.length();
        return new Vector
        (   u.x * L,
            u.y * L
        );
    }

    // Computes the component-wise mapping of a vector with a specified transformation.
    static map(u: Vector, transform: (n: number) => number): Vector
    {
        return new Vector
        (   transform(u.x),
            transform(u.y)
        );
    }

    // This vector's horizontal component.
    x: number;
    // This vector's vertical component.
    y: number;

    // Negates this (in-place).
    negate(): Vector
    {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    // Normalizes this (in-place).
    normalize(): Vector
    {
        const L = 1 / this.length();
        this.x *= L;
        this.y *= L;
        return this;
    }
    // Preserves direction but sets a vector's length to the specified value.
    set_length(scalar: number): Vector
    {
        const L = scalar / this.length();
        this.x *= L;
        this.y *= L;
        return this;
    }

    // Assign the value of another vector to this (in-place).
    assign(other: Vector): Vector
    {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    // Performs component-wise addition of another vector to this (in-place).
    add(other: Vector): Vector
    {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    // Performs component-wise subtraction of another vector from this (in-place).
    subtract(other: Vector): Vector
    {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    // Scales this (in-place).
    scale(scalar: number): Vector
    {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    // Performs component-wise mapping of this (in-place).
    map(transform: (n: number) => number): Vector
    {
        this.x = transform(this.x);
        this.y = transform(this.y);
        return this;
    }

    // Computes the dot product between this and another vector.
    dot(other: Vector): number
    {
        return this.x * other.x +
               this.y * other.y;
    }
    // Computes the z-component of the cross product between this and another vector.
    cross(other: Vector): number
    {
        return this.x * other.y -
               this.y * other.x;
    }

    // Computes the squared length of this.
    length_squared(): number
    {
        return this.x * this.x +
               this.y * this.y;
    }
    // Computes the length of this.
    length(): number
    {
        return Math.sqrt
        (   this.x * this.x +
            this.y * this.y
        );
    }

    // Computes the squared distance between this and another vector.
    distance_squared_to(other: Vector): number
    {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return dx * dx + dy * dy;
    }
    // Computes the distance between this and another vector.
    distance_to(other: Vector): number
    {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
