(function()
{
	const VIEWPORT =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	const RADIUS = 1;

	let ground, disc;

	testing.register
	({
		title: "Bouncing",

		get viewport() { return VIEWPORT; },

		setup: function(Physics)
		{
			const world = new Physics.World();

			disc = world.spawn(1, RADIUS);
			disc.body.position = new Physics.Vector(VIEWPORT.width / 2, VIEWPORT.height - RADIUS);
			disc.applied_force = new Physics.Vector(0, -10);
			disc.style =
			{
				fill: FillStyle.Wireframe,
				line_width: 0.1,
				color: "blue"
			};

			ground = world.spawn(1, 1);
			ground.is_static = true;
			ground.body.position = new Physics.Vector(disc.body.position.x, RADIUS);
			ground.style =
			{
				fill: FillStyle.Solid,
				color: "red"
			};

			return world;
		},
		step: function()
		{
			ground.body.position.x = disc.body.position.x;
		}
	});
})();
