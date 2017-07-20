(function()
{
	const VIEWPORT =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	const N_PARTICLES = 100;
	const RADIUS = 0.2;
	const ELASTICITY = 0.99;
	const SPEED = 6;
	const PALETTE = ["red", "green", "blue", "purple", "orange", "pink", "brown"];

	let particles = [];

	testing.register
	({
		title: "Particles in a box (naive)",

		get viewport() { return VIEWPORT; },

		setup: function(Physics)
		{
			const world = new Physics.World();

			VIEWPORT.size = new Physics.Vector(VIEWPORT.width, VIEWPORT.height);

			for (let i = 0; i < N_PARTICLES; ++i)
			{
				const particle = world.spawn(1, RADIUS, ELASTICITY);

				particle.body.position.x = random_in_range(RADIUS, VIEWPORT.width - RADIUS);
				particle.body.position.y = random_in_range(RADIUS, VIEWPORT.height - RADIUS);

				particle.body.velocity = new Physics.Vector()
				    .map(_ => random_in_range(-1, 1))
					.set_length(SPEED);

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

				if (p.x < RADIUS) { p.x = RADIUS; v.x *= -1; }
				if (p.x > VIEWPORT.width - RADIUS) { p.x = VIEWPORT.width - RADIUS; v.x *= -1 }
				if (p.y < RADIUS) { p.y = RADIUS; v.y *= -1; }
				if (p.y > VIEWPORT.height - RADIUS) { p.y = VIEWPORT.height - RADIUS; v.y *= -1 }
			});
		}
	});

	function random_in_range(lower, upper)
	{
		return lower + Math.random() * (upper - lower);
	}
})();
