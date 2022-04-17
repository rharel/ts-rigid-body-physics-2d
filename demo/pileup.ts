import { EntityStyles, render_world_animation } from "../source/rendering";
import { World } from "../source/simulation";

const WORLD_SIZE = 10;
const NR_PARTICLES = 25;
const PARTICLE_RADIUS_MIN = 0.02 * WORLD_SIZE;
const PARTICLE_RADIUS_MAX = 0.05 * WORLD_SIZE;
const PARTICLE_INITIAL_VELOCITY_RANGE = 0.01 * WORLD_SIZE;
const ENTITY_ELASTICITY = 0.75;
const GRAVITY_FORCE = -2;
const PALETTE = ["red", "green", "blue", "purple", "orange", "pink", "brown"];

function random_in_range(lower: number, upper: number): number {
  return lower + Math.random() * (upper - lower);
}

function setup() {
  const entity_styles: EntityStyles = {};

  const world = new World({
    size: WORLD_SIZE,
    collision_culling_subdivisions: 2,
    high_precision: true,
  });

  const ground_id = world.spawn({
    radius: world.options.size,
    elasticity: ENTITY_ELASTICITY,
    static: true,
    position: {
      x: 0.5 * world.options.size,
      y: -0.8 * world.options.size,
    },
  });
  entity_styles[ground_id] = { fill: "black" };

  for (let i = 0; i < NR_PARTICLES; ++i) {
    const radius = random_in_range(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX);
    const mass = Math.PI * radius * radius;
    const particle_id = world.spawn({
      mass,
      radius,
      elasticity: ENTITY_ELASTICITY,
      position: {
        x: random_in_range(radius, world.options.size - radius),
        y: world.options.size - radius,
      },
      velocity: {
        x: random_in_range(
          -PARTICLE_INITIAL_VELOCITY_RANGE,
          PARTICLE_INITIAL_VELOCITY_RANGE
        ),
        y: 0,
      },
      applied_force: {
        x: 0,
        y: GRAVITY_FORCE,
      },
    });
    entity_styles[particle_id] = { fill: PALETTE[i % PALETTE.length] };
  }

  const canvas = document.getElementById(
    "simulation-canvas"
  ) as HTMLCanvasElement;

  const controls = render_world_animation(world, canvas, entity_styles, () => {
    world.for_each_entity((entity_id, entity) => {
      if (entity.velocity.x === 0 && entity.velocity.y === 0) {
        return;
      }
      if (entity.position.x < entity.radius) {
        entity.position.x = entity.radius;
        entity.velocity.x *= -1;
      }
      if (entity.position.x > world.options.size - entity.radius) {
        entity.position.x = world.options.size - entity.radius;
        entity.velocity.x *= -1;
      }
      world.update(entity_id, entity);
    });
  });

  setTimeout(controls.pause, 8000);
}

window.addEventListener("DOMContentLoaded", setup);
