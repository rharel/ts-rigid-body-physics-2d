(function()
{
	const BOX =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	const RADIUS = 0.2;
	const SPEED = 6;

	let particles = [];

	function create_test_case(entity_count)
	{
		return {
			title: "Particles in a box (naive n=" + entity_count + ")",

			setup: function(Physics)
			{
				const world = new Physics.World();

				BOX.size = new Physics.Vector(BOX.width, BOX.height);

				const r = BOX.width / 4;
				for (let i = 0; i < entity_count; ++i)
				{
					const particle = world.spawn(1, RADIUS);

					particle.body.position.x = random_in_range(RADIUS, BOX.width - RADIUS);
					particle.body.position.y = random_in_range(RADIUS, BOX.height - RADIUS);

					particle.body.velocity = new Physics.Vector()
						.map(_ => random_in_range(-1, 1))
						.set_length(SPEED);

					particles.push(particle);
				}
				const obstacle = world.spawn(1, 4 * RADIUS);
				obstacle.is_static = true;
				obstacle.body.position = Physics.Vector.scale(BOX.size, 0.5);

				return world;
			},
			step: function()
			{
				particles.forEach(particle =>
				{
					const p = particle.body.position;
					const v = particle.body.velocity;

					if (p.x < RADIUS) { p.x = RADIUS; v.x *= -1; }
					if (p.x > BOX.width - RADIUS) { p.x = BOX.width - RADIUS; v.x *= -1 }
					if (p.y < RADIUS) { p.y = RADIUS; v.y *= -1; }
					if (p.y > BOX.height - RADIUS) { p.y = BOX.height - RADIUS; v.y *= -1 }
				});
			}
		}
	}
	testing.register(create_test_case(100));
	testing.register(create_test_case(1000));

	function random_in_range(lower, upper)
	{
		return lower + Math.random() * (upper - lower);
	}
})();
