(function()
{
	const VIEWPORT =
	{
		x: 0, y: 0,
		width: 10,
		height: 10
	};
	testing.register
	({
		title: "Separation",

		get viewport() { return VIEWPORT; },

		setup: function(Physics)
		{
			const world = new Physics.World();

			const a = world.spawn(1, 1);
			a.body.position = new Physics.Vector(4.5, 5);
			a.style =
			{
				fill: FillStyle.Wireframe,
				line_width: 0.1,
				color: "red"
			};

			const b = world.spawn(1, 1);
			b.body.position = new Physics.Vector(5.5, 5);
			b.style =
			{
				fill: FillStyle.Wireframe,
				line_width: 0.1,
				color: "blue"
			};

			return world;
		}
	});
})();
