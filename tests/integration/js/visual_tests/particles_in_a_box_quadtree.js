(function()
{
	const VIEWPORT =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	const N_PARTICLES = 25;
	const RADIUS = 0.25;
	const SPEED = 6;
	const PALETTE = ["red", "green", "blue", "purple", "orange", "pink", "brown"];
	const NODE_STYLE = { fill: FillStyle.Solid, color: "rgba(0, 0, 255, 0.25)" };

	let particles = [];
	let quadtree;

	testing.register
	({
		title: "Particles in a box (quadtree)",

		get viewport() { return VIEWPORT; },

		setup: function(Physics)
		{
			quadtree = new Physics.Quadtree
			(	4,
				Physics.BoundingBox.from_center_and_size
				(	VIEWPORT.width / 2, VIEWPORT.height / 2,
					VIEWPORT.width, VIEWPORT.height
				)
			);
			const world = new Physics.World
			({	broadphase: new Physics.QuadtreeBroadphase(quadtree),
			    do_step_piecewise: true
			});

			VIEWPORT.size = new Physics.Vector(VIEWPORT.width, VIEWPORT.height);

			const r = VIEWPORT.width / 4;
			for (let i = 0; i < N_PARTICLES; ++i)
			{
				const particle = world.spawn(1, RADIUS);

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
		},
		end_step: function()
		{
			const renderer = rendering.renderer;
			renderer.begin();
			quadtree.for_each_leaf_with_at_least(1, node =>
			{
				const style = Object.assign({}, NODE_STYLE);
				if (node.population_count > 1) { style.color = "rgba(0, 255, 0, 0.25)"; }

				renderer.draw_bounding_box(node.bounds, style);
			});
			renderer.end();
		}
	});

	function random_in_range(lower, upper)
	{
		return lower + Math.random() * (upper - lower);
	}
})();
