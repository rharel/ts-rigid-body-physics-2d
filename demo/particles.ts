import { EntityStyles, render_world_animation } from "../source/rendering";
import { World } from "../source/simulation";
import { Vec2 } from "../source/geometry";

const WORLD_SIZE = 10;
const NR_PARTICLES = 1000;
const PARTICLE_ENTITY_RADIUS_MIN = 0.002 * WORLD_SIZE;
const PARTICLE_ENTITY_RADIUS_MAX = 0.005 * WORLD_SIZE;
const PARTICLE_VELOCITY_MIN = 0.1 * WORLD_SIZE;
const PARTICLE_VELOCITY_MAX = 0.3 * WORLD_SIZE;
const PARTICLE_ELASTICITY = 0.9;
const PALETTE = ["red", "green", "blue", "purple", "orange", "pink", "brown"];

function random_in_range(lower: number, upper: number): number {
  return lower + Math.random() * (upper - lower);
}

function setup() {
  const entity_styles: EntityStyles = {};

  const world = new World({
    size: WORLD_SIZE,
    collision_culling_subdivisions: 4,
    high_precision: true,
  });

  for (let i = 0; i < NR_PARTICLES; ++i) {
    const radius = random_in_range(
      PARTICLE_ENTITY_RADIUS_MIN,
      PARTICLE_ENTITY_RADIUS_MAX
    );
    const mass = Math.PI * radius * radius;
    const particle_id = world.spawn({
      mass,
      radius,
      elasticity: PARTICLE_ELASTICITY,
      position: {
        x: random_in_range(radius, world.options.size - radius),
        y: random_in_range(radius, world.options.size - radius),
      },
      velocity: new Vec2(
        random_in_range(-1, 1),
        random_in_range(-1, 1)
      ).set_length(
        random_in_range(PARTICLE_VELOCITY_MIN, PARTICLE_VELOCITY_MAX)
      ),
    });
    entity_styles[particle_id] = { fill: PALETTE[i % PALETTE.length] };
  }

  const canvas = document.getElementById(
    "simulation-canvas"
  ) as HTMLCanvasElement;

  const fps = document.getElementById("fps") as HTMLElement;

  let latest_fps_time = performance.now();
  let fps_sum = 0;
  let nr_fps_samples = 0;

  const controls = render_world_animation(world, canvas, entity_styles, () => {
    const now = performance.now();
    fps_sum += 1000 / (now - latest_fps_time);
    nr_fps_samples += 1;
    latest_fps_time = now;
    fps.textContent = (fps_sum / nr_fps_samples).toPrecision(2).toString();

    world.for_each_entity((entity_id, entity) => {
      let update_required = false;
      if (entity.position.x < entity.radius) {
        entity.position.x = entity.radius;
        entity.velocity.x *= -1;
        update_required = true;
      }
      if (entity.position.x > world.options.size - entity.radius) {
        entity.position.x = world.options.size - entity.radius;
        entity.velocity.x *= -1;
        update_required = true;
      }
      if (entity.position.y < entity.radius) {
        entity.position.y = entity.radius;
        entity.velocity.y *= -1;
        update_required = true;
      }
      if (entity.position.y > world.options.size - entity.radius) {
        entity.position.y = world.options.size - entity.radius;
        entity.velocity.y *= -1;
        update_required = true;
      }
      if (update_required) {
        world.update(entity_id, {
          position: entity.position,
          velocity: entity.velocity,
        });
      }
    });
  });

  setTimeout(controls.pause, 50000);
}

window.addEventListener("DOMContentLoaded", setup);
