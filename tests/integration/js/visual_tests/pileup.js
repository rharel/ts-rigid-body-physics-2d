(function()
{
	const VIEWPORT =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	const N_PARTICLES = 25;
	const RADIUS = {min: 0.2, max: 0.5};
	const ELASTICITY = 0.75;
	const PALETTE = ["red", "green", "blue", "purple", "orange", "pink", "brown"];

	let particles = [];

	testing.register
	({
		title: "Pileup",

		get viewport() { return VIEWPORT; },

		setup: function(Physics)
		{
			const world = new Physics.World();

			VIEWPORT.size = new Physics.Vector(VIEWPORT.width, VIEWPORT.height);

			// Spawn floor:
			const floor = world.spawn(1, VIEWPORT.width, ELASTICITY);
			floor.is_static = true;
			floor.body.position.x = 0.5 * VIEWPORT.width;
			floor.body.position.y = -VIEWPORT.width + 2;
			floor.style = { fill: FillStyle.Solid, color: "black" };

			// Spawn particles:
			for (let i = 0; i < N_PARTICLES; ++i)
			{
				const radius = random_in_range(RADIUS.min, RADIUS.max);
				const mass = Math.PI * radius * radius;

				const particle = world.spawn(mass, radius, ELASTICITY);

				particle.body.position.x = random_in_range(radius, VIEWPORT.width - radius);
				particle.body.position.y = VIEWPORT.height - radius;

				particle.applied_force = new Physics.Vector(0, -9.8);
				particle.body.velocity.x = random_in_range(-0.1, 0.1);

				particle.style =
				{
					fill: FillStyle.Solid,
					color: PALETTE[i % PALETTE.length]
				};

				particles.push(particle);
			}

			return world;
		},
		step: function()
		{
			particles.forEach(particle =>
			{
				const p = particle.body.position;
				const v = particle.body.velocity;
				const r = particle.geometry.radius;

				if (v.length_squared() === 0) { return; }
				if (p.x < r)                  { p.x = r; v.x *= -1; }
				if (p.x > VIEWPORT.width - r) { p.x = VIEWPORT.width - r; v.x *= -1 }
			});
		}
	});

	function random_in_range(lower, upper)
	{
		return lower + Math.random() * (upper - lower);
	}
})();
